import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ToSentenceCase } from '../../../common/transformers/text.transformers';
import { CreatePersonDto } from './create-person.dto';

export class CreateLegalPersonDto extends CreatePersonDto {
  @IsNotEmpty()
  @MaxLength(50)
  @IsString()
  @Transform(ToSentenceCase)
  organizationName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(ToSentenceCase)
  socialReason?: string | null;

  @IsOptional()
  @IsUrl()
  website?: string | null;
}
