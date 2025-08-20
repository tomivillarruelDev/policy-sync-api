import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Identification } from './entity/identification.entity';
import { IdentificationType } from './entity/identification-type.entity';
import { Person } from '../../entities/person.entity';
import { IdentificationController } from './identification.controller';
import { IdentificationService } from './services/identification.service';
import { IdentificationTypeController } from './identification-type.controller';
import { IdentificationTypeService } from './services/identification-type.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Identification, IdentificationType, Person]),
  ],
  controllers: [IdentificationController, IdentificationTypeController],
  providers: [IdentificationService, IdentificationTypeService],
  exports: [IdentificationService, IdentificationTypeService],
})
export class IdentificationModule {}
