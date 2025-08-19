import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { Person } from './entities/person.entity';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepo: Repository<Person>,
  ) {}

  async create(createPersonDto: CreatePersonDto): Promise<Person> {
    try {
      const person = this.personRepo.create(createPersonDto);
      return await this.personRepo.save(person);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(): Promise<Person[]> {
    return this.personRepo.find();
  }

  async findOne(id: string): Promise<Person> {
    const person = await this.personRepo.findOne({ where: { id } });
    if (!person) throw new NotFoundException(`Person ${id} no encontrada`);
    return person;
  }

  async update(id: string, updatePersonDto: UpdatePersonDto): Promise<Person> {
    const person = await this.findOne(id);
    Object.assign(person, updatePersonDto);
    try {
      return await this.personRepo.save(person);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.personRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Person ${id} no encontrada`);
  }

  private handleDBErrors(error: any): never {
    // PostgreSQL unique violation
    if (error?.code === '23505') {
      throw new BadRequestException('Ya existe una persona con ese email');
    }
    // Log y error genérico
    // eslint-disable-next-line no-console
    console.error(error);
    throw new InternalServerErrorException('Error al procesar la persona');
  }
}
