import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAddressDto {
  @IsUUID()
  @IsNotEmpty()
  countryId: string;

  @IsUUID()
  @IsNotEmpty()
  stateId: string;

  @IsUUID()
  @IsNotEmpty()
  cityId: string;

  @IsUUID()
  @IsNotEmpty()
  personId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  street: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  streetNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  zipCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  apartment?: string;
}
