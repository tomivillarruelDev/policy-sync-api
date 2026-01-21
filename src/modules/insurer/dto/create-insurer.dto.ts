import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';
import { ToTitleCase, ToUpperCase } from '../../../common/transformers/text.transformers';
import { CreateLegalPersonDto } from '../../person/dto/create-legal-person.dto';

export class CreateInsurerDto extends CreateLegalPersonDto {
  @IsString()
  @IsNotEmpty()
  @Transform(ToUpperCase)
  code: string;

  @IsString()
  @IsOptional()
  @Transform(ToTitleCase)
  executive?: string | null;

  @IsString()
  @IsOptional()
  agencyNumber?: string | null;

  @IsUrl()
  @IsOptional()
  logoUrl?: string | null;
}
