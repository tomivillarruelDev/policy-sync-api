import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { CreateLegalPersonDto } from '../../person/dto/create-legal-person.dto';

export class CreateInsurerDto extends CreateLegalPersonDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  executive?: string | null;

  @IsString()
  @IsOptional()
  agencyNumber?: string | null;

  @IsUrl()
  @IsOptional()
  logoUrl?: string | null;
}
