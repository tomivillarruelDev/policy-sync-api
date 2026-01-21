import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RealPerson } from '../entities/real-person.entity';
import { CreateRealPersonDto } from '../dto/create-real-person.dto';
import { handleDBErrors } from '../../../common/utils/typeorm-errors.util';
import { mapPersonData } from '../common/mappers';
import { UpdateRealPersonDto } from '../dto/update-real-person.dto';
import { PersonType } from '../enums/person-type.enum';
import { updatePersonFields } from '../common/utils/person-update.util';
import { Person } from '../../person/entities/person.entity';
import { REAL_PERSON_RELATIONS } from '../common/constants/relations.constant';

@Injectable()
export class RealPersonService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepo: Repository<Person>,
    @InjectRepository(RealPerson)
    private readonly realRepo: Repository<RealPerson>,
    private readonly dataSource: DataSource,
  ) { }

  async create(dto: CreateRealPersonDto): Promise<RealPerson> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const repo = qr.manager.getRepository(RealPerson);
      const real = repo.create({
        ...dto,
        person: mapPersonData(dto, PersonType.REAL),
      });

      const saved = await repo.save(real);
      await qr.commitTransaction();
      return saved;
    } catch (error) {
      await qr.rollbackTransaction();
      handleDBErrors(error);
    } finally {
      await qr.release();
    }
  }

  async findAll(): Promise<RealPerson[]> {
    return this.realRepo.find({
      relations: REAL_PERSON_RELATIONS,
    });
  }

  async findOne(id: string): Promise<RealPerson> {
    const entity = await this.realRepo.findOne({
      where: { id },
      relations: REAL_PERSON_RELATIONS,
    });
    if (!entity) throw new NotFoundException(`RealPerson ${id} no encontrada`);
    return entity;
  }

  async update(id: string, dto: UpdateRealPersonDto): Promise<RealPerson> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const realRepo = qr.manager.getRepository(RealPerson);
      const entity = await realRepo.findOne({
        where: { id },
        relations: REAL_PERSON_RELATIONS,
      });

      if (!entity) throw new NotFoundException(`RealPerson ${id} no encontrada`);

      Object.assign(entity, dto);

      updatePersonFields(entity.person, dto);

      await realRepo.save(entity);

      await qr.commitTransaction();
      return this.findOne(id);
    } catch (error) {
      await qr.rollbackTransaction();
      handleDBErrors(error);
    } finally {
      await qr.release();
    }
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.realRepo.remove(entity);
  }
}
