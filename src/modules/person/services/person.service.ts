import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '../entities/person.entity';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepo: Repository<Person>,
  ) {}

  async create(createPersonDto: any): Promise<Person> {
    const person = this.personRepo.create(createPersonDto as Partial<Person>);
    return this.personRepo.save(person as any);
  }

  async findAll(): Promise<Person[]> {
    return this.personRepo.find();
  }

  async findOne(id: string): Promise<Person> {
    const person = await this.personRepo.findOne({ where: { id } });
    if (!person) throw new NotFoundException(`Person ${id} no encontrada`);
    return person;
  }

  async update(id: string, updatePersonDto: any): Promise<Person> {
    const person = await this.findOne(id);
    Object.assign(person, updatePersonDto);
    return this.personRepo.save(person);
  }

  async remove(id: string): Promise<void> {
    const result = await this.personRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Person ${id} no encontrada`);
  }
}
