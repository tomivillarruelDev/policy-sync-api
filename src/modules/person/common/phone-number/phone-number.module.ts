import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhoneNumberService } from './phone-number.service';
import { PhoneNumberController } from './phone-number.controller';
import { PhoneNumber } from './entities/phone-number.entity';
import { Person } from '../../entities/person.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PhoneNumber, Person])],
  controllers: [PhoneNumberController],
  providers: [PhoneNumberService],
})
export class PhoneNumberModule {}
