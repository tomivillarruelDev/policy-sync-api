import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Identification } from '../entity/identification.entity';
import { IdentificationType } from '../entity/identification-type.entity';
import { Person } from '../../../entities/person.entity';
import { CreateIdentificationDto } from '../dto/create-identification.dto';
import { UpdateIdentificationDto } from '../dto/update-identification.dto';
import { FilterIdentificationDto } from '../dto/filter-identification.dto';
import { handleDBErrors } from '../../../../../common/utils/typeorm-errors.util';

@Injectable()
export class IdentificationService {
  constructor(
    @InjectRepository(Identification)
    private readonly identificationRepo: Repository<Identification>,
    @InjectRepository(IdentificationType)
    private readonly typeRepo: Repository<IdentificationType>,
    @InjectRepository(Person)
    private readonly personRepo: Repository<Person>,
  ) {}

  async create(dto: CreateIdentificationDto): Promise<Identification> {
    const type = await this.typeRepo.findOne({ where: { id: dto.typeId } });
    if (!type) throw new NotFoundException('IdentificationType no encontrado');

    const person = await this.personRepo.findOne({
      where: { id: dto.personId },
    });
    if (!person) throw new NotFoundException('Person no encontrada');

    const identification = this.identificationRepo.create({
      number: dto.number,
      type,
      person,
    });
    try {
      return await this.identificationRepo.save(identification);
    } catch (e: any) {
      handleDBErrors(e);
      return undefined as never;
    }
  }

  findAll(filters?: FilterIdentificationDto): Promise<Identification[]> {
    const where: any = {};
    if (filters?.personId) where.person = { id: filters.personId };
    if (filters?.typeId) where.type = { id: filters.typeId };
    return this.identificationRepo.find({
      where: Object.keys(where).length ? where : undefined,
      relations: { person: true },
    });
  }

  async findOne(id: string): Promise<Identification> {
    const identification = await this.identificationRepo.findOne({
      where: { id },
      relations: { person: true },
    });
    if (!identification)
      throw new NotFoundException('Identification no encontrada');
    return identification;
  }

  async update(
    id: string,
    dto: UpdateIdentificationDto,
  ): Promise<Identification> {
    const identification = await this.findOne(id);

    if (dto.number !== undefined) identification.number = dto.number;

    if (dto.typeId) {
      const type = await this.typeRepo.findOne({ where: { id: dto.typeId } });
      if (!type)
        throw new NotFoundException('IdentificationType no encontrado');
      identification.type = type;
    }

    if (dto.personId) {
      const person = await this.personRepo.findOne({
        where: { id: dto.personId },
      });
      if (!person) throw new NotFoundException('Person no encontrada');
      identification.person = person;
    }

    try {
      return await this.identificationRepo.save(identification);
    } catch (e: any) {
      handleDBErrors(e);
      return undefined as never;
    }
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    try {
      const result = await this.identificationRepo.delete(id);
      if (!result.affected)
        throw new NotFoundException('Identification no encontrada');
      return { deleted: true };
    } catch (e: any) {
      handleDBErrors(e);
      return undefined as never;
    }
  }
}
