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


@Injectable()
export class RealPersonService {
  constructor(
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
        person: mapPersonData(dto, PersonType.REAL)
      })

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
    return this.realRepo.find();
  }

  async findOne(id: string): Promise<RealPerson> {
    const entity = await this.realRepo.findOne({
      where: { id },
    });
    if (!entity) throw new NotFoundException(`RealPerson ${id} no encontrada`);
    return entity;
  }

  async update(id: string, dto: UpdateRealPersonDto): Promise<RealPerson> {
    const entity = await this.findOne(id);

    // Update RealPerson specific fields
    if (dto.firstName) entity.firstName = dto.firstName;
    if (dto.lastName) entity.lastName = dto.lastName;

    // Update nested Person fields
    updatePersonFields(entity.person, dto);

    try {
      return await this.realRepo.save(entity);
    } catch (error) {
      handleDBErrors(error);
    }
  }


  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.realRepo.remove(entity);
  }
}
