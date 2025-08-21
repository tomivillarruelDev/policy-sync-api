import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Person } from '../entities/person.entity';
import { RealPerson } from '../entities/real-person.entity';
import { CreateRealPersonDto } from '../dto/create-real-person.dto';
import { handleDBErrors } from '../../../common/utils/typeorm-errors.util';

@Injectable()
export class RealPersonService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepo: Repository<Person>,
    @InjectRepository(RealPerson)
    private readonly realRepo: Repository<RealPerson>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateRealPersonDto): Promise<Person> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      // 1. Crear persona base
      const person = qr.manager.getRepository(Person).create({
        emails: dto.emails,
        addresses: dto.addresses,
        phoneNumbers: dto.phoneNumbers,
        identifications: dto.identifications,
      });
      const savedPerson = await qr.manager.getRepository(Person).save(person);

      // 2. Crear subtipo real asociado
      const real = qr.manager.getRepository(RealPerson).create({
        ...dto,
        person: savedPerson,
      });
      const savedReal = await qr.manager.getRepository(RealPerson).save(real);

      // 3. Confirmar transacción
      await qr.commitTransaction();

      // 4. Retornar compuesto
      return { ...savedPerson, realPerson: savedReal } as Person & {
        realPerson: RealPerson;
      };
    } catch (error) {
      await qr.rollbackTransaction();
      handleDBErrors(error);
    } finally {
      await qr.release();
    }
  }

  async findAll(): Promise<RealPerson[]> {
    return this.realRepo.find({ relations: ['person'] });
  }

  async findOne(id: string): Promise<RealPerson> {
    const entity = await this.realRepo.findOne({
      where: { id },
      relations: ['person'],
    });
    if (!entity) throw new NotFoundException(`RealPerson ${id} no encontrada`);
    return entity;
  }
}

