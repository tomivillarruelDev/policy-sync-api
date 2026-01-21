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

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Transform(Trim)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Transform(ToUpperCase)
  code: string;

  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @IsNumber()
  @Min(0)
  insuredAmount: number;

  @IsUUID()
  insurerId: string;
}
