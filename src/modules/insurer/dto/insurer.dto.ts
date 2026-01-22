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

  // --- Flattened Fields for Form ---
  @Expose()
  name: string;  // Alias for organizationName

  @Expose()
  account: string;  // From emails[0].account

  @Expose()
  phone: string;  // From phoneNumbers[0].number

  @Expose()
  address: string;  // From addresses[0].street

  @Expose()
  city: string;  // From addresses[0].city.id

  @Expose()
  state: string;  // From addresses[0].city.state.id

  @Expose()
  country: string;  // From addresses[0].city.state.country.id

  @Expose()
  identificationType: string;  // From identifications[0].type.id

  @Expose()
  identificationValue: string;  // From identifications[0].value
}
