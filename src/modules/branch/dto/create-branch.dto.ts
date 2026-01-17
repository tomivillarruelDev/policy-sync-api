import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ToSentenceCase, ToUpperCase } from '../../../common/transformers/text.transformers';

export class CreateBranchDto {
    @IsNotEmpty()
    @IsUUID()
    insurerId: string;

    @IsNotEmpty()
    @IsString()
    @Transform(ToSentenceCase)
    name: string;

    @IsNotEmpty()
    @IsString()
    @Transform(ToUpperCase)
    code: string;
}
