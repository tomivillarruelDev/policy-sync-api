import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';
import { LegalPerson } from 'src/modules/person/entities/legal-person.entity';
import { handleDBErrors } from 'src/common/utils/typeorm-errors.util';
import { RealPersonService } from '../../services/real-person.service';
import { RealPerson } from 'src/modules/person/entities/real-person.entity';
import { mapAddressDto, mapIdentificationDto, mapPersonData } from '../../common/mappers';
import { PersonType } from '../../enums/person-type.enum';
import { updatePersonFields } from '../../common/utils/person-update.util';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly dataSource: DataSource,
  ) { }

  async create(dto: CreateContactDto): Promise<Contact> {
    if (dto.legalPerson && dto.legalPersonId) {
      throw new BadRequestException(
        'No se puede enviar legalPersonId y legalPerson a la vez',
      );
    }

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const repo = qr.manager.getRepository(Contact);
      const contact = repo.create({
        realPerson: {
          ...dto.realPerson,
          person: mapPersonData(dto.realPerson, PersonType.REAL),
        },
        legalPerson: dto.legalPersonId
          ? { id: dto.legalPersonId }
          : dto.legalPerson
            ? {
              ...dto.legalPerson,
              person: {
                type: PersonType.LEGAL,
                emails: dto.legalPerson.emails,
                phoneNumbers: dto.legalPerson.phoneNumbers,
                addresses: mapAddressDto(dto.legalPerson.addresses),
                identifications: mapIdentificationDto(
                  dto.legalPerson.identifications,
                ),
              },
            }
            : undefined,
      });

      const saved = await repo.save(contact); // guarda todo gracias al cascade
      await qr.commitTransaction();
      return saved;
    } catch (e) {
      await qr.rollbackTransaction();
      handleDBErrors(e);
    } finally {
      await qr.release();
    }
  }

  findAll(): Promise<Contact[]> {
    // Eager ya carga relaciones, find() es suficiente
    return this.contactRepository.find();
  }

  async findOne(id: string): Promise<Contact> {
    const entity = await this.contactRepository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Contact no encontrado');
    return entity;
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

      // 1) Borrar Contact primero para liberar la FK hacia RealPerson
      await contactRepo.remove(entity);

      // 2) Borrar explícitamente RealPerson (por si el cascade de remove no se dispara)
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

  async update(id: string, dto: UpdateContactDto): Promise<Contact> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const repo = qr.manager.getRepository(Contact);
      const entity = await repo.findOne({
        where: { id },
        relations: ['realPerson', 'realPerson.person', 'legalPerson', 'legalPerson.person']
      });
      if (!entity) throw new NotFoundException('Contact no encontrado');

      // Update RealPerson (always exists on Contact)
      if (dto.realPerson) {
        if (dto.realPerson.firstName) entity.realPerson.firstName = dto.realPerson.firstName;
        if (dto.realPerson.lastName) entity.realPerson.lastName = dto.realPerson.lastName;
        updatePersonFields(entity.realPerson.person, dto.realPerson);
        await qr.manager.getRepository(RealPerson).save(entity.realPerson);
      }

      // Update LegalPerson (optional on Contact)
      if (dto.legalPersonId) {
        // Switching legal person
        if (dto.legalPersonId !== entity.legalPerson?.id) {
          const newLegal = await qr.manager.getRepository(LegalPerson).findOne({ where: { id: dto.legalPersonId } });
          if (!newLegal) throw new NotFoundException('LegalPerson no encontrada');
          entity.legalPerson = newLegal;
        }
      } else if (dto.legalPerson && entity.legalPerson) {
        // Updating existing attached legal person
        if (dto.legalPerson.organizationName) entity.legalPerson.organizationName = dto.legalPerson.organizationName;
        if (dto.legalPerson.socialReason !== undefined) entity.legalPerson.socialReason = dto.legalPerson.socialReason;
        if (dto.legalPerson.website !== undefined) entity.legalPerson.website = dto.legalPerson.website;

        updatePersonFields(entity.legalPerson.person, dto.legalPerson);
        await qr.manager.getRepository(LegalPerson).save(entity.legalPerson);
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
}
