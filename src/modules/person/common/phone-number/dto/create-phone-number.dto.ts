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
  contactNumber: string;

  @IsUUID()
  @IsNotEmpty()
  personId: string;
}
