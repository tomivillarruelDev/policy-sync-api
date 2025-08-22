import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Person } from '../entities/person.entity';
import { LegalPerson } from '../entities/legal-person.entity';
import { CreateLegalPersonDto } from '../dto/create-legal-person.dto';
import { handleDBErrors } from '../../../common/utils/typeorm-errors.util';
import { mapAddressDto, mapIdentificationDto } from '../common/mappers';

@Injectable()
export class LegalPersonService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepo: Repository<Person>,
    @InjectRepository(LegalPerson)
    private readonly legalRepo: Repository<LegalPerson>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateLegalPersonDto): Promise<Person> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      // 1. Crear persona base
      const person = qr.manager.getRepository(Person).create({
        emails: dto.emails,
        phoneNumbers: dto.phoneNumbers,
        addresses: mapAddressDto(dto.addresses),
        identifications: mapIdentificationDto(dto.identifications),
      });
      const savedPerson = await qr.manager.getRepository(Person).save(person);

      // 2. Crear subtipo (LegalPerson)
      const legal = qr.manager.getRepository(LegalPerson).create({
        ...dto,
        person: savedPerson,
      });
      const savedLegal = await qr.manager
        .getRepository(LegalPerson)
        .save(legal);

      // 3. Confirmar transacción
      await qr.commitTransaction();

      // 4. Retornar compuesto
      return { ...savedPerson, legalPerson: savedLegal } as Person & {
        legalPerson: LegalPerson;
      };
    } catch (error) {
      await qr.rollbackTransaction();
      handleDBErrors(error);
    } finally {
      await qr.release();
    }
  }

  async findAll(): Promise<LegalPerson[]> {
    return this.legalRepo.find({ relations: ['person'] });
  }

  async findOne(id: string): Promise<LegalPerson> {
    const entity = await this.legalRepo.findOne({
      where: { id },
      relations: ['person'],
    });
    if (!entity) throw new NotFoundException(`LegalPerson ${id} no encontrada`);
    return entity;
  }
}
