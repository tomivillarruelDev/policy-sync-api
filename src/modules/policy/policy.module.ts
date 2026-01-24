import { Module } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { PolicyController } from './policy.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Policy } from './entities/policy.entity';
import { PolicyDependent } from './entities/policy-dependent.entity';
import { PolicyCategoryModule } from './catalogs/policy-category/policy-category.module';
import { PolicyStatusModule } from './catalogs/policy-status/policy-status.module';
import { RelationTypeModule } from './catalogs/relation-type/relation-type.module';
import { VehicleUsageModule } from './catalogs/vehicle-usage/vehicle-usage.module';
import { VehicleTypeModule } from './catalogs/vehicle-type/vehicle-type.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Policy, PolicyDependent]),
    PolicyCategoryModule,
    PolicyStatusModule,
    RelationTypeModule,
    VehicleUsageModule,
    VehicleTypeModule,
  ],
  controllers: [PolicyController],
  providers: [PolicyService],
  exports: [
    PolicyService,
    PolicyCategoryModule,
    PolicyStatusModule,
    RelationTypeModule,
    VehicleUsageModule,
    VehicleTypeModule,
  ],
})
export class PolicyModule { }
