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

    // --- Campos Aplanados para Formulario ---
    @Expose()
    account: string;  // De emails[0].account

    @Expose()
    phone: string;  // De phoneNumbers[0].number

    @Expose()
    street: string;  // De addresses[0].street

    @Expose()
    streetNumber: string;  // De addresses[0].streetNumber

    @Expose()
    city: string;  // De addresses[0].city.id

    @Expose()
    state: string;  // De addresses[0].city.state.id

    @Expose()
    country: string;  // De addresses[0].city.state.country.id

    @Expose()
    identificationType: string;  // De identifications[0].type.id

    @Expose()
    identificationValue: string;  // De identifications[0].value
}
