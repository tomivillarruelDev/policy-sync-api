import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAgentDto {
    @IsString()
    @IsNotEmpty()
    agentCode: string;

    @IsString()
    @IsNotEmpty()
    licenseNumber: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsUUID()
    @IsNotEmpty()
    personId: string;
}
