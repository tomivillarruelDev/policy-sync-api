import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../entities/addresses.entity';
import { Country } from '../entities/country.entity';
import { State } from '../entities/state.entity';
import { City } from '../entities/city.entity';
import { Person } from '../../../entities/person.entity';
import { handleDBErrors } from '../../../../../common/utils/typeorm-errors.util';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address) private readonly addrRepo: Repository<Address>,
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
    @InjectRepository(State) private readonly stateRepo: Repository<State>,
    @InjectRepository(City) private readonly cityRepo: Repository<City>,
    @InjectRepository(Person) private readonly personRepo: Repository<Person>,
  ) {}

  async create(dto: CreateAddressDto): Promise<Address> {
    const [country, state, city, person] = await Promise.all([
      this.countryRepo.findOne({ where: { id: dto.countryId } }),
      this.stateRepo.findOne({ where: { id: dto.stateId } }),
      this.cityRepo.findOne({ where: { id: dto.cityId } }),
      this.personRepo.findOne({ where: { id: dto.personId } }),
    ]);

    if (!country) throw new NotFoundException('Country no encontrado');
    if (!state) throw new NotFoundException('State no encontrado');
    if (!city) throw new NotFoundException('City no encontrada');
    if (!person) throw new NotFoundException('Person no encontrada');

    const address = this.addrRepo.create({
      street: dto.street,
      streetNumber: dto.streetNumber,
      zipCode: dto.zipCode,
      apartment: dto.apartment,
      country,
      state,
      city,
      person,
    });
    try {
      return await this.addrRepo.save(address);
    } catch (e: any) {
      handleDBErrors(e);
      return undefined as never;
    }
  }

  findAll(): Promise<Address[]> {
    return this.addrRepo.find({ relations: { person: true } });
  }

  async findOne(id: string): Promise<Address> {
    const entity = await this.addrRepo.findOne({
      where: { id },
      relations: { person: true },
    });
    if (!entity) throw new NotFoundException('Address no encontrada');
    return entity;
  }

  async update(id: string, dto: UpdateAddressDto): Promise<Address> {
    const entity = await this.findOne(id);
    if (dto.street !== undefined) entity.street = dto.street;
    if (dto.streetNumber !== undefined) entity.streetNumber = dto.streetNumber;
    if (dto.zipCode !== undefined) entity.zipCode = dto.zipCode;
    if (dto.apartment !== undefined) entity.apartment = dto.apartment;
    if (dto.countryId) {
      const country = await this.countryRepo.findOne({
        where: { id: dto.countryId },
      });
      if (!country) throw new NotFoundException('Country no encontrado');
      entity.country = country;
    }
    if (dto.stateId) {
      const state = await this.stateRepo.findOne({
        where: { id: dto.stateId },
      });
      if (!state) throw new NotFoundException('State no encontrado');
      entity.state = state;
    }
    if (dto.cityId) {
      const city = await this.cityRepo.findOne({ where: { id: dto.cityId } });
      if (!city) throw new NotFoundException('City no encontrada');
      entity.city = city;
    }
    if (dto.personId) {
      const person = await this.personRepo.findOne({
        where: { id: dto.personId },
      });
      if (!person) throw new NotFoundException('Person no encontrada');
      entity.person = person;
    }
    try {
      return await this.addrRepo.save(entity);
    } catch (e: any) {
      handleDBErrors(e);
      return undefined as never;
    }
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    try {
      const res = await this.addrRepo.delete(id);
      if (!res.affected) throw new NotFoundException('Address no encontrada');
      return { deleted: true };
    } catch (e: any) {
      handleDBErrors(e);
      return undefined as never;
    }
  }
}
