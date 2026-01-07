import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Person } from '../entities/person.entity';
import { LegalPerson } from '../entities/legal-person.entity';
import { CreateLegalPersonDto } from '../dto/create-legal-person.dto';
import { handleDBErrors } from '../../../common/utils/typeorm-errors.util';
import { mapPersonData } from '../common/mappers';
import { UpdateLegalPersonDto } from '../dto/update-legal-person.dto';
import { PersonType } from '../enums/person-type.enum';
import { updatePersonFields } from '../common/utils/person-update.util';

@Injectable()
export class LegalPersonService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepo: Repository<Person>,
    @InjectRepository(LegalPerson)
    private readonly legalRepo: Repository<LegalPerson>,
    private readonly dataSource: DataSource,
  ) { }

  async create(dto: CreateLegalPersonDto): Promise<LegalPerson> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const repo = qr.manager.getRepository(LegalPerson);
      const legal = repo.create({
        ...dto,
        person: mapPersonData(dto, PersonType.LEGAL)
      })

      const saved = await repo.save(legal);
      await qr.commitTransaction();
      return saved;

    } catch (error) {
      await qr.rollbackTransaction();
      handleDBErrors(error);
    } finally {
      await qr.release();
    }
  }

  async findAll(): Promise<LegalPerson[]> {
    return this.legalRepo.find();
  }

  async findOne(id: string): Promise<LegalPerson> {
    const entity = await this.legalRepo.findOne({
      where: { id },
    });
    if (!entity) throw new NotFoundException(`LegalPerson ${id} no encontrada`);
    return entity;
  }

  async update(id: string, dto: UpdateLegalPersonDto): Promise<LegalPerson> {
    const entity = await this.findOne(id);

    // Update LegalPerson specific fields
    if (dto.organizationName) entity.organizationName = dto.organizationName;
    if (dto.socialReason !== undefined) entity.socialReason = dto.socialReason;
    if (dto.website !== undefined) entity.website = dto.website;

    // Update nested Person fields
    updatePersonFields(entity.person, dto);

    try {
      return await this.legalRepo.save(entity);
    } catch (error) {
      handleDBErrors(error);
    }
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.legalRepo.remove(entity);
  }
}
