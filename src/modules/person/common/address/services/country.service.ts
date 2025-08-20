import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../entities/country.entity';
import { CreateCountryDto } from '../dto/create-country.dto';
import { UpdateCountryDto } from '../dto/update-country.dto';
import { handleDBErrors } from '../../../../../common/utils/typeorm-errors.util';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country) private readonly repo: Repository<Country>,
  ) {}

  async create(dto: CreateCountryDto): Promise<Country> {
    const entity = this.repo.create(dto);
    try {
      return await this.repo.save(entity);
    } catch (e) {
      handleDBErrors(e);
      return undefined as never;
    }
  }

  findAll(): Promise<Country[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Country> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Country no encontrado');
    return entity;
  }

  async update(id: string, dto: UpdateCountryDto): Promise<Country> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
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
      if (!res.affected) throw new NotFoundException('Country no encontrado');
      return { deleted: true };
    } catch (e) {
      handleDBErrors(e);
      return undefined as never;
    }
  }
}
