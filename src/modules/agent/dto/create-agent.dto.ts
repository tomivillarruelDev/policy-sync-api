import { IsString, IsOptional, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRealPersonDto } from '../../person/dto/create-real-person.dto';

export class CreateAgentDto {
    @IsString()
    @IsNotEmpty()
    agentCode: string;

    @IsString()
    @IsOptional()
    licenseNumber?: string;

    @ValidateNested()
    @Type(() => CreateRealPersonDto)
    person: CreateRealPersonDto;
}
