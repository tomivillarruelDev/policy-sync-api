import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Person } from '../../entities/person.entity';
import { LegalPerson } from '../../entities/legal-person.entity';
import { Business } from './entities/business.entity';
import { CreateBusinessFromScratchDto } from './dto/create-business-from-scratch.dto';
import { mapAddressDto, mapIdentificationDto } from '../../common/mappers';
import { handleDBErrors } from '../../../../common/utils/typeorm-errors.util';
import { PersonType } from '../../enums/person-type.enum';

@Injectable()
export class BusinessOrchestrator {
  constructor(private readonly dataSource: DataSource) { }

  async createAll(dto: CreateBusinessFromScratchDto): Promise<Business> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const person = qr.manager.getRepository(Person).create({
        type: PersonType.LEGAL,
        emails: dto.legal.emails,
        phoneNumbers: dto.legal.phoneNumbers,
        addresses: mapAddressDto(dto.legal.addresses),
        identifications: mapIdentificationDto(dto.legal.identifications),
      });
      const savedPerson = await qr.manager.getRepository(Person).save(person);

      const legal = qr.manager.getRepository(LegalPerson).create({
        ...dto.legal,
        person: savedPerson,
      });
      const savedLegal = await qr.manager
        .getRepository(LegalPerson)
        .save(legal);

      const business = qr.manager.getRepository(Business).create({
        legalPerson: savedLegal,
      } as Partial<Business>);
      const savedBusiness = await qr.manager
        .getRepository(Business)
        .save(business);

      await qr.commitTransaction();
      return savedBusiness as Business;
    } catch (e) {
      await qr.rollbackTransaction();
      handleDBErrors(e);
    } finally {
      await qr.release();
    }
  }
}
