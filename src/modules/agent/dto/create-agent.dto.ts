import { IsString, IsOptional, IsNotEmpty, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ToUpperCase } from '../../../common/transformers/text.transformers';
import { CreateRealPersonDto } from '../../person/dto/create-real-person.dto';

export class CreateAgentDto extends CreateRealPersonDto {
    @IsString()
    @IsNotEmpty()
    @Transform(ToUpperCase)
    agentCode: string;

    @IsString()
    @IsOptional()
    @Transform(ToUpperCase)
    licenseNumber?: string | null;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
