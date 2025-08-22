import { Module } from '@nestjs/common';
import { PersonService } from './services/person.service';
import { PersonController } from './person.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './entities/person.entity';
import { RealPerson } from './entities/real-person.entity';
import { LegalPerson } from './entities/legal-person.entity';
import { RealPersonService } from './services/real-person.service';
import { LegalPersonService } from './services/legal-person.service';
import { PhoneNumberModule } from './common/phone-number/phone-number.module';
import { IdentificationModule } from './common/identification/identification.module';
import { AddressModule } from './common/address/address.module';
import { BusinessModule } from './roles/business/business.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Person, RealPerson, LegalPerson]),
    IdentificationModule,
    PhoneNumberModule,
    AddressModule,
    BusinessModule,
  ],
  controllers: [PersonController],
  providers: [PersonService, RealPersonService, LegalPersonService],
})
export class PersonModule {}
