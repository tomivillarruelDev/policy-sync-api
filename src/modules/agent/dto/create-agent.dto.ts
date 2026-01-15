import { IsString, IsOptional, IsNotEmpty, IsBoolean } from 'class-validator';
import { CreateRealPersonDto } from '../../person/dto/create-real-person.dto';

export class CreateAgentDto extends CreateRealPersonDto {
    @IsString()
    @IsNotEmpty()
    agentCode: string;

    @IsString()
    @IsOptional()
    licenseNumber?: string | null;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
