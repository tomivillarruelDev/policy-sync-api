import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreatePlanDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
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
