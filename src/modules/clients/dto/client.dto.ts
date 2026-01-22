import { Expose, Type } from 'class-transformer';
import { Identification } from '../../person/common/identification/entity/identification.entity';
import { PhoneNumber } from '../../person/common/phone-number/entities/phone-number.entity';
import { Email } from '../../person/entities/email.entity';
import { AddressResponseDto } from '../../person/common/mappers/address.mapper';
import { Gender } from '../../person/entities/gender.entity';

export class ClientDto {
    @Expose()
    id: string;

    @Expose()
    isActive: boolean;

    // Propiedades Directas de Persona
    @Expose()
    firstName: string;

    @Expose()
    lastName: string;

    @Expose()
    birthday: Date;

    @Expose()
    @Type(() => Gender)
    gender: Gender;

    @Expose()
    genderId: string;

    @Expose()
    civilStatusId: string;

    @Expose()
    nationalityId: string;

    // Flattened Contact Fields
    @Expose()
    account: string;

    @Expose()
    phone: string;

    // Flattened Address Fields
    @Expose()
    street: string;

    @Expose()
    streetNumber: string;

    @Expose()
    city: string;

    @Expose()
    state: string;

    @Expose()
    country: string;

    // Flattened Identification Fields
    @Expose()
    identificationType: string;

    @Expose()
    identificationValue: string;

    // Colecciones Completas (NO Strings sueltos)
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
