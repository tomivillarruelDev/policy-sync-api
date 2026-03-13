import { IsNotEmpty, IsString, IsUUID, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { ToUpperCase, Trim } from '../../../common/transformers/text.transformers';
import { RiskType } from '../enums/risk-type.enum';

export class CreateBranchDto {
    @IsNotEmpty()
    @IsUUID()
    insurerId: string;

    @IsNotEmpty()
    @IsString()
    @Transform(Trim)
    name: string;

    @IsNotEmpty()
    @IsString()
    @Transform(ToUpperCase)
    code: string;

    @IsNotEmpty()
    @IsEnum(RiskType)
    riskType: RiskType;
}
