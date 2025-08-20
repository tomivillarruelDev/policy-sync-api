import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressService } from './services/address.service';
import { AddressController } from './address.controller';
import { Address } from './entities/addresses.entity';
import { Country } from './entities/country.entity';
import { State } from './entities/state.entity';
import { City } from './entities/city.entity';
import { Person } from '../../entities/person.entity';
import { CountryController } from './country.controller';
import { CountryService } from './services/country.service';
import { StateController } from './state.controller';
import { StateService } from './services/state.service';
import { CityController } from './city.controller';
import { CityService } from './services/city.service';

@Module({
  imports: [TypeOrmModule.forFeature([Address, Country, State, City, Person])],
  controllers: [
    AddressController,
    CountryController,
    StateController,
    CityController,
  ],
  providers: [AddressService, CountryService, StateService, CityService],
})
export class AddressModule {}
