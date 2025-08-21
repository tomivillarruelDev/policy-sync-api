import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { CreatePersonDto } from './create-person.dto';

export class CreateLegalPersonDto extends CreatePersonDto{
  @IsString()
  @MinLength(1)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  legalName?: string;

  @IsOptional()
  @IsString()
  cuit?: string;
}
