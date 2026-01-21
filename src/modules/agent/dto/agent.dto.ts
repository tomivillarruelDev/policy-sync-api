import { Expose, Type } from 'class-transformer';
import { AddressResponseDto } from '../../person/common/mappers/address.mapper';
import { Gender } from '../../person/entities/gender.entity';
import { Identification } from '../../person/common/identification/entity/identification.entity';
import { PhoneNumber } from '../../person/common/phone-number/entities/phone-number.entity';
import { Email } from '../../person/entities/email.entity';

export class AgentDto {
    @Expose()
    id: string;

    @Expose()
    agentCode: string;

    @Expose()
    licenseNumber: string;

    @Expose()
    isActive: boolean;

    @Expose()
    firstName: string;

    @Expose()
    lastName: string;



    @Expose()
    genderId: string;



    @Expose()
    @Type(() => Email)
    emails: Email[];

    @Expose()
    @Type(() => PhoneNumber)
    phoneNumbers: PhoneNumber[];

    @Expose()
    @Type(() => Identification)
    identifications: Identification[];

    @Expose()
    @Type(() => AddressResponseDto)
    addresses: AddressResponseDto[];
}
