import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { CreatePhoneNumberDto } from '../common/phone-number/dto/create-phone-number.dto';
import { CreateEmailDto } from './create-email.dto';
import { CreateAddressDto } from '../common/address/dto/create-address.dto';
import { CreateIdentificationDto } from '../common/identification/dto/create-identification.dto';

export class CreatePersonDto {
  // Relaciones en cascada opcionales
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePhoneNumberDto)
  // personId se setea por el servicio al asociar la Person creada
  phoneNumbers?: Omit<CreatePhoneNumberDto, 'personId'>[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEmailDto)
  emails?: Omit<CreateEmailDto, 'personId'>[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAddressDto)
  // personId se setea por el servicio al asociar la Person creada
  addresses?: Omit<CreateAddressDto, 'personId'>[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIdentificationDto)
  // personId se setea por el servicio al asociar la Person creada
  identifications?: Omit<CreateIdentificationDto, 'personId'>[];
}
