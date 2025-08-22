import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { CreatePersonDto } from './create-person.dto';

export class CreateLegalPersonDto extends CreatePersonDto {
  @IsNotEmpty()
  @MaxLength(100)
  @IsString()
  organizationName: string;

  @IsOptional()
  @IsUrl()
  website?: string;
}
