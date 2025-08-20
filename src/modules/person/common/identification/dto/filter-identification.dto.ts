import { IsOptional, IsUUID } from 'class-validator';

export class FilterIdentificationDto {
  @IsOptional()
  @IsUUID()
  personId?: string;

  @IsOptional()
  @IsUUID()
  typeId?: string;
}
