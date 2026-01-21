import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationSeeder } from './location.seeder';
import { SeederService } from './seeder.service';
import { GenderSeeder } from './gender.seeder';
import { CivilStatusSeeder } from './civil-status.seeder';

import { Country } from '../modules/person/common/address/entities/country.entity';
import { State } from '../modules/person/common/address/entities/state.entity';
import { City } from '../modules/person/common/address/entities/city.entity';
import { IdentificationType } from '../modules/person/common/identification/entity/identification-type.entity';
import { Identification } from '../modules/person/common/identification/entity/identification.entity';
import { Gender } from '../modules/person/entities/gender.entity';
import { CivilStatus } from '../modules/person/entities/civil-status.entity';
import { IdentificationSeeder } from './identification.seeder';
import { CatalogVerificationSeeder } from './catalog-verification.seeder';
import { InsurerModule } from '../modules/insurer/insurer.module';
import { ProductModule } from '../modules/product/product.module';
import { PlanModule } from '../modules/plan/plan.module';
import { PersonModule } from '../modules/person/person.module';
import { AgentModule } from '../modules/agent/agent.module';
import { PolicyModule } from '../modules/policy/policy.module';
import { BranchModule } from '../modules/branch/branch.module';
import { ClientsModule } from '../modules/clients/clients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Country,
      State,
      City,
      IdentificationType,
      Identification,
      Gender,
      CivilStatus,
    ]),
    InsurerModule,
    ProductModule,
    PlanModule,
    PersonModule,
    AgentModule,
    PolicyModule,
    AgentModule,
    PolicyModule,
    BranchModule,
    ClientsModule,
  ],
  providers: [
    LocationSeeder,
    SeederService,
    IdentificationSeeder,
    GenderSeeder,
    CivilStatusSeeder,
    CatalogVerificationSeeder,
  ],
  exports: [SeederService],
})
export class SeederModule { }
