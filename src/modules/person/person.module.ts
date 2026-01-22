import { Module } from '@nestjs/common';
import { PersonService } from './services/person.service';
import { PersonController } from './person.controller';
import { GenderController } from './gender.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './entities/person.entity';
import { RealPerson } from './entities/real-person.entity';
import { Gender } from './entities/gender.entity';
import { Nationality } from './entities/nationality.entity';
import { LegalPerson } from './entities/legal-person.entity';
import { RealPersonService } from './services/real-person.service';
import { LegalPersonService } from './services/legal-person.service';
import { GenderService } from './services/gender.service';
import { PhoneNumberModule } from './common/phone-number/phone-number.module';
import { IdentificationModule } from './common/identification/identification.module';
import { AddressModule } from './common/address/address.module';
import { CivilStatus } from './entities/civil-status.entity';
import { CivilStatusController } from './civil-status.controller';
import { CivilStatusService } from './services/civil-status.service';
import { NationalityController } from './nationality.controller';
import { NationalityService } from './services/nationality.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Person, RealPerson, LegalPerson, Gender, Nationality, CivilStatus]),
    IdentificationModule,
    PhoneNumberModule,
    AddressModule,

  ],
  controllers: [PersonController, GenderController, CivilStatusController, NationalityController],
  providers: [PersonService, RealPersonService, LegalPersonService, GenderService, CivilStatusService, NationalityService],
  exports: [PersonService, RealPersonService, LegalPersonService, GenderService, CivilStatusService, NationalityService],
})
export class PersonModule { }
