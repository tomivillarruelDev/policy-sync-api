import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ToSentenceCase, ToUpperCase } from '../../../common/transformers/text.transformers';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  @Transform(ToSentenceCase)
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
