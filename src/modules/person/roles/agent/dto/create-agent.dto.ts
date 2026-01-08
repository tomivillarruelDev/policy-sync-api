import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRealPersonDto } from '../../../dto/create-real-person.dto';

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

    @IsOptional()
    @ValidateNested()
    @Type(() => CreateRealPersonDto)
    realPerson?: CreateRealPersonDto;

    @IsOptional()
    @IsUUID()
    realPersonId?: string;
}
