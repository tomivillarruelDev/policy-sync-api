import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePhoneNumberDto } from './dto/create-phone-number.dto';
import { UpdatePhoneNumberDto } from './dto/update-phone-number.dto';
import { PhoneNumber } from './entities/phone-number.entity';
import { Person } from '../../entities/person.entity';
import { handleDBErrors } from '../../../../common/utils/typeorm-errors.util';

@Injectable()
export class PhoneNumberService {
  constructor(
    @InjectRepository(PhoneNumber)
    private readonly phoneRepo: Repository<PhoneNumber>,
    @InjectRepository(Person)
    private readonly personRepo: Repository<Person>,
  ) { }

  async create(dto: CreatePhoneNumberDto): Promise<PhoneNumber> {
    const person = await this.personRepo.findOne({
      where: { id: dto.personId },
    });
    if (!person) throw new NotFoundException('Person no encontrada');

    const entity = this.phoneRepo.create({
      number: dto.number,
      person,
    });
    try {
      return await this.phoneRepo.save(entity);
    } catch (e: any) {
      handleDBErrors(e);
      return undefined as never;
    }
  }

  findAll(): Promise<PhoneNumber[]> {
    return this.phoneRepo.find({ relations: { person: true } });
  }

  async findOne(id: string): Promise<PhoneNumber> {
    const entity = await this.phoneRepo.findOne({
      where: { id },
      relations: { person: true },
    });
    if (!entity) throw new NotFoundException('PhoneNumber no encontrado');
    return entity;
  }

  async update(id: string, dto: UpdatePhoneNumberDto): Promise<PhoneNumber> {
    const entity = await this.findOne(id);
    if (dto.number !== undefined)
      entity.number = dto.number;
    if (dto.personId) {
      const person = await this.personRepo.findOne({
        where: { id: dto.personId },
      });
      if (!person) throw new NotFoundException('Person no encontrada');
      entity.person = person;
    }
    try {
      return await this.phoneRepo.save(entity);
    } catch (e: any) {
      handleDBErrors(e);
      return undefined as never;
    }
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    try {
      const res = await this.phoneRepo.delete(id);
      if (!res.affected)
        throw new NotFoundException('PhoneNumber no encontrado');
      return { deleted: true };
    } catch (e: any) {
      handleDBErrors(e);
      return undefined as never;
    }
  }
}
