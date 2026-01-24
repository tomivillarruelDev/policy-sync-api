import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationSeeder } from './location.seeder';
import { SeederService } from './seeder.service';
import { GenderSeeder } from './gender.seeder';
import { NationalitySeeder } from './nationality.seeder';
import { CivilStatusSeeder } from './civil-status.seeder';
import { PolicyCategorySeeder } from './policy-category.seeder';
import { PolicyStatusSeeder } from './policy-status.seeder';
import { RelationTypeSeeder } from './relation-type.seeder';
import { VehicleUsageSeeder } from './vehicle-usage.seeder';
import { VehicleTypeSeeder } from './vehicle-type.seeder';
import { PropertyTypeSeeder } from './property-type.seeder';
import { RoofMaterialSeeder } from './roof-material.seeder';

import { Country } from '../modules/person/common/address/entities/country.entity';
import { State } from '../modules/person/common/address/entities/state.entity';
import { City } from '../modules/person/common/address/entities/city.entity';
import { IdentificationType } from '../modules/person/common/identification/entity/identification-type.entity';
import { Identification } from '../modules/person/common/identification/entity/identification.entity';
import { Gender } from '../modules/person/entities/gender.entity';
import { Nationality } from '../modules/person/entities/nationality.entity';
import { CivilStatus } from '../modules/person/entities/civil-status.entity';
import { PolicyCategory } from '../modules/policy/catalogs/policy-category/policy-category.entity';
import { PolicyStatus } from '../modules/policy/catalogs/policy-status/policy-status.entity';
import { RelationType } from '../modules/policy/catalogs/relation-type/relation-type.entity';
import { VehicleUsage } from '../modules/policy/catalogs/vehicle-usage/vehicle-usage.entity';
import { VehicleType } from '../modules/policy/catalogs/vehicle-type/vehicle-type.entity';
import { PropertyType } from '../modules/policy/catalogs/property-type/property-type.entity';
import { RoofMaterial } from '../modules/policy/catalogs/roof-material/roof-material.entity';
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
      Nationality,
      CivilStatus,
      PolicyCategory,
      PolicyStatus,
      RelationType,
      VehicleUsage,
      VehicleType,
      PropertyType,
      RoofMaterial,
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
    NationalitySeeder,
    CivilStatusSeeder,
    PolicyCategorySeeder,
    PolicyStatusSeeder,
    RelationTypeSeeder,
    VehicleUsageSeeder,
    VehicleTypeSeeder,
    PropertyTypeSeeder,
    RoofMaterialSeeder,
    CatalogVerificationSeeder,
  ],
  exports: [SeederService],
})
export class SeederModule { }
