import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsEnum,
  IsDate,
  IsUUID,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ToTitleCase } from '../../../common/transformers/text.transformers';
import { CreatePersonDto } from './create-person.dto';
import { CivilStatus } from '../enums/civil-status.enum';

export class CreateRealPersonDto extends CreatePersonDto {
  @IsNotEmpty()
  @MinLength(2)
  @IsString()
  @Transform(ToTitleCase)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Transform(ToTitleCase)
  lastName: string;

  @IsOptional()
  @IsString()
  @Transform(ToTitleCase)
  middleName?: string | null;

  @IsOptional()
  @IsString()
  @Transform(ToTitleCase)
  maternalLastName?: string | null;

  @IsOptional()
  @IsString()
  nationality?: string | null;

  @IsOptional()
  @IsDate()
  birthDate?: Date | null;

  @IsOptional()
  @IsUUID()
  genderId?: string;

  @IsOptional()
  @IsEnum(CivilStatus)
  civilStatus?: CivilStatus | null;
}
