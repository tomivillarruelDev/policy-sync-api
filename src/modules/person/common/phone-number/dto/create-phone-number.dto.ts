import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePhoneNumberDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(30)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\D+/g, '') : value,
  )
  contactNumber: string;

  @IsUUID()
  @IsNotEmpty()
  personId: string;
}
