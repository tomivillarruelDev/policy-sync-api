import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
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
