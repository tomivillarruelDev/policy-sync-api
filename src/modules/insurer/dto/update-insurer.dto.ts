import { PartialType } from '@nestjs/mapped-types';
import { CreateInsurerDto } from './create-insurer.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateInsurerDto extends PartialType(CreateInsurerDto) {
  @IsOptional()
  @IsUUID()
  legalPersonId?: string;
}
