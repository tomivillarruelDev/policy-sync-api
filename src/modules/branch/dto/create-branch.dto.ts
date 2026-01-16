import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateBranchDto {
    @IsNotEmpty()
    @IsUUID()
    insurerId: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    code: string;
}
