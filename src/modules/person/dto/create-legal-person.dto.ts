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
  @MaxLength(50)
  @IsString()
  organizationName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  socialReason?: string;

  @IsOptional()
  @IsUrl()
  website?: string;
}
