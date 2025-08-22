import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../entities/city.entity';
import { CreateCityDto } from '../dto/create-city.dto';
import { UpdateCityDto } from '../dto/update-city.dto';
import { State } from '../entities/state.entity';
import { handleDBErrors } from '../../../../../common/utils/typeorm-errors.util';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City) private readonly repo: Repository<City>,
    @InjectRepository(State) private readonly stateRepo: Repository<State>,
  ) {}

  async create(dto: CreateCityDto): Promise<City> {
    const state = await this.stateRepo.findOne({ where: { id: dto.stateId } });
    if (!state) throw new NotFoundException('State no encontrado');
    const entity = this.repo.create({ name: dto.name, state });
    try {
      return await this.repo.save(entity);
    } catch (e) {
      handleDBErrors(e);
      return undefined as never;
    }
  }

  findAll(stateId?: string): Promise<City[]> {
    if (stateId) {
      return this.repo.find({ where: { state: { id: stateId } } });
    }
    return this.repo.find();
  }

  async findOne(id: string): Promise<City> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('City no encontrada');
    return entity;
  }

  async update(id: string, dto: UpdateCityDto): Promise<City> {
    const entity = await this.findOne(id);
    if (dto.name !== undefined) entity.name = dto.name;
    if (dto.stateId) {
      const state = await this.stateRepo.findOne({
        where: { id: dto.stateId },
      });
      if (!state) throw new NotFoundException('State no encontrado');
      entity.state = state;
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
      if (!res.affected) throw new NotFoundException('City no encontrada');
      return { deleted: true };
    } catch (e) {
      handleDBErrors(e);
      return undefined as never;
    }
  }
}
