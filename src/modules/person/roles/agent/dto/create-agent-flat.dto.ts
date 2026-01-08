import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateRealPersonDto } from '../../../dto/create-real-person.dto';

export class CreateAgentFlatDto extends CreateRealPersonDto {
    @IsString()
    @IsNotEmpty()
    agentCode: string;

    @IsString()
    @IsNotEmpty()
    licenseNumber: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
