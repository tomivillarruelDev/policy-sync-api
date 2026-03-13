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
    birthDate: Date;

    @Expose()
    @Type(() => Gender)
    gender: Gender;

    @Expose()
    genderId: string;

    @Expose()
    civilStatusId: string;

    @Expose()
    nationalityId: string;

    // --- Campos Aplanados para Contacto ---
    @Expose()
    account: string;  // De emails[0].account

    @Expose()
    phone: string;  // De phoneNumbers[0].number

    // --- Campos Aplanados para Dirección ---
    @Expose()
    street: string;

    @Expose()
    streetNumber: string;

    @Expose()
    city: string;  // De addresses[0].city.id

    @Expose()
    state: string;  // De addresses[0].city.state.id

    @Expose()
    country: string;  // De addresses[0].city.state.country.id

    // --- Campos Aplanados para Identificación ---
    @Expose()
    identificationType: string;  // De identifications[0].type.id

    @Expose()
    identificationValue: string;  // De identifications[0].valuetas
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
