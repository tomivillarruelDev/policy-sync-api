import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { State } from '../entities/state.entity';
import { CreateStateDto } from '../dto/create-state.dto';
import { UpdateStateDto } from '../dto/update-state.dto';
import { Country } from '../entities/country.entity';
import { handleDBErrors } from '../../../../../common/utils/typeorm-errors.util';

@Injectable()
export class StateService {
  constructor(
    @InjectRepository(State) private readonly repo: Repository<State>,
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
  ) {}

  async create(dto: CreateStateDto): Promise<State> {
    const country = await this.countryRepo.findOne({
      where: { id: dto.countryId },
    });
    if (!country) throw new NotFoundException('Country no encontrado');
    const entity = this.repo.create({ name: dto.name, country });
    try {
      return await this.repo.save(entity);
    } catch (e) {
      handleDBErrors(e);
      return undefined as never;
    }
  }

  findAll(): Promise<State[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<State> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('State no encontrado');
    return entity;
  }

  async update(id: string, dto: UpdateStateDto): Promise<State> {
    const entity = await this.findOne(id);
    if (dto.name !== undefined) entity.name = dto.name;
    if (dto.countryId) {
      const country = await this.countryRepo.findOne({
        where: { id: dto.countryId },
      });
      if (!country) throw new NotFoundException('Country no encontrado');
      entity.country = country;
    }
    try {
      return await this.repo.save(entity);
    } catch (e) {
      handleDBErrors(e);
      return undefined as never;
    }
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    try {
      const res = await this.repo.delete(id);
      if (!res.affected) throw new NotFoundException('State no encontrado');
      return { deleted: true };
    } catch (e) {
      handleDBErrors(e);
      return undefined as never;
    }
  }
}
