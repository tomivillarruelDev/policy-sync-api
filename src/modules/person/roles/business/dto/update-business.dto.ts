import { PartialType } from '@nestjs/swagger';
import { CreateBusinessDto } from './create-business.dto';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateLegalPersonDto } from 'src/modules/person/dto/update-legal-person.dto';

export class UpdateBusinessDto extends PartialType(CreateBusinessDto) {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateLegalPersonDto)
  legalPerson?: UpdateLegalPersonDto;
}
