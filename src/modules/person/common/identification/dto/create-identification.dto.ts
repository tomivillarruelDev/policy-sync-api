import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ToUpperCase } from '../../../../../common/transformers/text.transformers';

export class CreateIdentificationDto {
  @IsString()
  @IsNotEmpty()
  @Transform(ToUpperCase)
  value: string;

  @IsUUID()
  @IsNotEmpty()
  typeId: string;

  @IsUUID()
  @IsNotEmpty()
  personId: string;
}
