import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateLegalPersonDto } from 'src/modules/person/dto/create-legal-person.dto';
import { CreateRealPersonDto } from 'src/modules/person/dto/create-real-person.dto';

export class CreateContactDto {
  @ValidateNested()
  @Type(() => CreateRealPersonDto)
  realPerson: CreateRealPersonDto;

  @ValidateNested()
  @IsOptional()
  @Type(() => CreateLegalPersonDto)
  legalPerson?: CreateLegalPersonDto;

  @IsOptional()
  @IsUUID()
  legalPersonId?: string;
}
