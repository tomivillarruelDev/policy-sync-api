import { IsEmail, IsNotEmpty, IsOptional, IsString, Min, MinLength, IsEnum } from 'class-validator';
import { CreatePersonDto } from './create-person.dto';
import { Gender } from '../enums/gender.enum';
import { CivilStatus } from '../enums/civil-status.enum';

export class CreateRealPersonDto extends CreatePersonDto {
  @IsNotEmpty()
  @MinLength(2)
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(CivilStatus)
  civilStatus?: CivilStatus;
}
