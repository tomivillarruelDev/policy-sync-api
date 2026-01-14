import { Type } from 'class-transformer';
import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { OmitType } from '@nestjs/swagger';
import { CreatePhoneNumberDto } from '../common/phone-number/dto/create-phone-number.dto';
import { CreateEmailDto } from './create-email.dto';
import { CreateAddressDto } from '../common/address/dto/create-address.dto';
import { CreateIdentificationDto } from '../common/identification/dto/create-identification.dto';

export class CreatePersonDto {
  // DTOs anidados sin personId (clases reales para que class-validator no exija personId)
  static PhoneForPerson = class extends OmitType(CreatePhoneNumberDto, [
    'personId',
  ] as const) {};
  static EmailForPerson = class extends OmitType(CreateEmailDto, [
    'personId',
  ] as const) {};
  static AddressForPerson = class extends OmitType(CreateAddressDto, [
    'personId',
  ] as const) {};
  static IdentificationForPerson = class extends OmitType(
    CreateIdentificationDto,
    ['personId'] as const,
  ) {};

  // Relaciones en cascada opcionales
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePersonDto.PhoneForPerson)
  // personId se setea por el servicio al asociar la Person creada
  phoneNumbers: InstanceType<typeof CreatePersonDto.PhoneForPerson>[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePersonDto.EmailForPerson)
  emails: InstanceType<typeof CreatePersonDto.EmailForPerson>[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePersonDto.AddressForPerson)
  // personId se setea por el servicio al asociar la Person creada
  addresses: InstanceType<typeof CreatePersonDto.AddressForPerson>[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePersonDto.IdentificationForPerson)
  // personId se setea por el servicio al asociar la Person creada
  identifications: InstanceType<
    typeof CreatePersonDto.IdentificationForPerson
  >[];
}
