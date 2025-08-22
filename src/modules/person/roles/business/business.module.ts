import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { Business } from './entities/business.entity';
import { LegalPerson } from '../../entities/legal-person.entity';
import { BusinessOrchestrator } from './business.orchestrator';

@Module({
  imports: [TypeOrmModule.forFeature([Business, LegalPerson])],
  controllers: [BusinessController],
  providers: [BusinessService, BusinessOrchestrator],
})
export class BusinessModule {}
