import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationSeeder } from './location.seeder';
import { SeederService } from './seeder.service';

import { Country } from '../modules/person/common/address/entities/country.entity';
import { State } from '../modules/person/common/address/entities/state.entity';
import { City } from '../modules/person/common/address/entities/city.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Country, State, City])],
  providers: [LocationSeeder, SeederService],
  exports: [SeederService],
})
export class SeederModule {}
