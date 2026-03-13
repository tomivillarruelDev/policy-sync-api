import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { AddressResponseDto } from '../../person/common/mappers/address.mapper';
import { Identification } from '../../person/common/identification/entity/identification.entity';
import { PhoneNumber } from '../../person/common/phone-number/entities/phone-number.entity';
import { Email } from '../../person/entities/email.entity';

export class InsurerDto {
  @Expose()
  id: string;

  @Expose()
  code: string;

  @Expose()
  executive?: string;

  @Expose()
  agencyNumber?: string;

  @Expose()
  logoUrl?: string;

  @Expose()
  organizationName: string;

  @Expose()
  socialReason?: string;

  @Expose()
  website?: string;

  @Expose()
  @Type(() => Email)
  emails: Email[];

  @Expose()
  @Type(() => PhoneNumber)
  phoneNumbers: PhoneNumber[];

  @Expose()
  @Type(() => AddressResponseDto)
  addresses: AddressResponseDto[];

  @Expose()
  @Type(() => Identification)
  identifications: Identification[];

  // --- Campos Aplanados para Formulario ---
  @Expose()
  name: string;  // Alias para organizationName

  @Expose()
  account: string;  // De emails[0].account

  @Expose()
  phone: string;  // De phoneNumbers[0].number

  @Expose()
  street: string;  // De addresses[0].street

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
