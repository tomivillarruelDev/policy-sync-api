import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdentificationType } from '../entity/identification-type.entity';
import { CreateIdentificationTypeDto } from '../dto/create-identification-type.dto';
import { UpdateIdentificationTypeDto } from '../dto/update-identification-type.dto';
import { handleDBErrors } from '../../../../../common/utils/typeorm-errors.util';

@Injectable()
export class IdentificationTypeService {
  constructor(
    @InjectRepository(IdentificationType)
    private readonly repo: Repository<IdentificationType>,
  ) {}

  async create(dto: CreateIdentificationTypeDto): Promise<IdentificationType> {
    const entity = this.repo.create(dto);
    try {
      return await this.repo.save(entity);
    } catch (e: any) {
      handleDBErrors(e);
      return undefined as never;
    }
  }

  findAll(): Promise<IdentificationType[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<IdentificationType> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity)
      throw new NotFoundException('IdentificationType no encontrado');
    return entity;
  }

  async update(
    id: string,
    dto: UpdateIdentificationTypeDto,
  ): Promise<IdentificationType> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    try {
      return await this.repo.save(entity);
    } catch (e: any) {
      handleDBErrors(e);
      return undefined as never;
    }
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    try {
      const res = await this.repo.delete(id);
      if (!res.affected)
        throw new NotFoundException('IdentificationType no encontrado');
      return { deleted: true };
    } catch (e: any) {
      handleDBErrors(e);
      return undefined as never;
    }
  }
}
