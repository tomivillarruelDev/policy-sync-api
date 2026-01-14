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
  @Expose()
  @Type(() => AddressResponseDto)
  addresses: AddressResponseDto[];

  @Expose()
  @Type(() => Identification)
  identifications: Identification[];
}
