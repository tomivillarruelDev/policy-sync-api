import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactDto } from './dto/contact.dto';
import { Contact } from './entities/contact.entity';
import { LegalPerson } from '../../entities/legal-person.entity';
import { handleDBErrors } from 'src/common/utils/typeorm-errors.util';
import { RealPerson } from '../../entities/real-person.entity';
import { mapPersonData } from '../../common/mappers';
import { PersonType } from '../../enums/person-type.enum';
import { updatePersonFields } from '../../common/utils/person-update.util';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly dataSource: DataSource,
  ) { }

  async create(createContactDto: CreateContactDto): Promise<ContactDto> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const repo = qr.manager.getRepository(Contact);

      const personData = mapPersonData(createContactDto, PersonType.REAL);

      const contact = repo.create({
        realPerson: {
          firstName: createContactDto.firstName,
          lastName: createContactDto.lastName,
          middleName: createContactDto.middleName,
          maternalLastName: createContactDto.maternalLastName,
          nationality: createContactDto.nationality,
          birthDate: createContactDto.birthDate ? new Date(createContactDto.birthDate) : undefined,
          gender: createContactDto.gender,
          civilStatus: createContactDto.civilStatus,
          person: personData
        },
        legalPerson: createContactDto.legalPersonId
          ? { id: createContactDto.legalPersonId }
          : undefined,
      });

      const saved = await repo.save(contact);
      await qr.commitTransaction();
      return this.toDto(saved);
    } catch (e) {
      await qr.rollbackTransaction();
      handleDBErrors(e);
    } finally {
      await qr.release();
    }
  }

  async findAll(): Promise<ContactDto[]> {
    const contacts = await this.contactRepository.find({
      relations: ['realPerson', 'realPerson.person', 'legalPerson']
    });
    return contacts.map(c => this.toDto(c));
  }

  async findOne(id: string): Promise<ContactDto> {
    const entity = await this.contactRepository.findOne({
      where: { id },
      relations: ['realPerson', 'realPerson.person', 'legalPerson']
    });
    if (!entity) throw new NotFoundException('Contact no encontrado');
    return this.toDto(entity);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const contactRepo = qr.manager.getRepository(Contact);
      const realRepo = qr.manager.getRepository(RealPerson);

      const entity = await contactRepo.findOne({
        where: { id },
        relations: ['realPerson'],
      });
      if (!entity) throw new NotFoundException('Contact no encontrado');

      const realId = entity.realPerson?.id;

      await contactRepo.remove(entity);

      // Borrar explícitamente RealPerson 
      if (realId) {
        await realRepo.delete(realId);
      }

      await qr.commitTransaction();
      return { deleted: true };
    } catch (e) {
      await qr.rollbackTransaction();
      handleDBErrors(e);
    } finally {
      await qr.release();
    }
  }

  async update(id: string, dto: UpdateContactDto): Promise<ContactDto> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const repo = qr.manager.getRepository(Contact);
      const entity = await repo.findOne({
        where: { id },
        relations: ['realPerson', 'realPerson.person', 'legalPerson']
      });
      if (!entity) throw new NotFoundException('Contact no encontrado');

      // Update RealPerson (always exists on Contact)
      if (dto.realPersonId) {
        if (dto.realPersonId !== entity.realPerson?.id) {
          const newReal = await qr.manager.getRepository(RealPerson).findOne({ where: { id: dto.realPersonId } });
          if (!newReal) throw new NotFoundException('Real Person not found');
          entity.realPerson = newReal;
        }
      } else if (entity.realPerson) {
        if (dto.firstName) entity.realPerson.firstName = dto.firstName;
        if (dto.lastName) entity.realPerson.lastName = dto.lastName;
        if (dto.middleName !== undefined) entity.realPerson.middleName = dto.middleName;
        if (dto.maternalLastName !== undefined) entity.realPerson.maternalLastName = dto.maternalLastName;
        if (dto.birthDate) entity.realPerson.birthDate = new Date(dto.birthDate);
        if (dto.gender) entity.realPerson.gender = dto.gender;
        if (dto.civilStatus) entity.realPerson.civilStatus = dto.civilStatus;
        if (dto.nationality) entity.realPerson.nationality = dto.nationality;

        updatePersonFields(entity.realPerson.person, dto);
        await qr.manager.getRepository(RealPerson).save(entity.realPerson);
      }

      // Update LegalPerson
      if (dto.legalPersonId) {
        if (dto.legalPersonId !== entity.legalPerson?.id) {
          const newLegal = await qr.manager.getRepository(LegalPerson).findOne({ where: { id: dto.legalPersonId } });
          if (!newLegal) throw new NotFoundException('LegalPerson no encontrada');
          entity.legalPerson = newLegal;
        }
      }

      await repo.save(entity);
      await qr.commitTransaction();
      return this.findOne(id);
    } catch (e) {
      await qr.rollbackTransaction();
      handleDBErrors(e);
    } finally {
      await qr.release();
    }
  }

  private toDto(contact: Contact): ContactDto {
    return plainToInstance(ContactDto, {
      id: contact.id,
      organizationName: contact.legalPerson?.organizationName,
      firstName: contact.realPerson?.firstName,
      lastName: contact.realPerson?.lastName,
      middleName: contact.realPerson?.middleName,
      maternalLastName: contact.realPerson?.maternalLastName,
      nationality: contact.realPerson?.nationality,
      birthDate: contact.realPerson?.birthDate,
      gender: contact.realPerson?.gender,
      civilStatus: contact.realPerson?.civilStatus,
      emails: contact.realPerson?.person?.emails || [],
      phoneNumbers: contact.realPerson?.person?.phoneNumbers || [],
      addresses: contact.realPerson?.person?.addresses || [],
      identifications: contact.realPerson?.person?.identifications || [],
    }, { excludeExtraneousValues: true });
  }
}
