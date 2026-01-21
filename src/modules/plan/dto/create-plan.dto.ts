import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ToUpperCase, Trim } from '../../../common/transformers/text.transformers';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  @Transform(Trim)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Transform(ToUpperCase)
  code: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  deductibleOne?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  deductibleTwo?: number;

  @IsUUID()
  productId: string;
}
