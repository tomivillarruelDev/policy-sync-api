import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    branch: string;

    @IsNumber()
    @Min(0)
    insuredAmount: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    specialBenefits?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    adminExpenses?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    deductibleOne?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    deductibleTwo?: number;

    @IsUUID()
    insurerId: string;
}
