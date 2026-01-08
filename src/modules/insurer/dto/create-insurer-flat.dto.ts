import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { CreateLegalPersonDto } from '../../person/dto/create-legal-person.dto';

export class CreateInsurerFlatDto extends CreateLegalPersonDto {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsOptional()
    executive?: string;

    @IsString()
    @IsOptional()
    agencyNumber?: string;

    @IsUrl()
    @IsOptional()
    logoUrl?: string;
}
