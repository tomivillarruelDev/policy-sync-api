import { IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateLegalPersonDto } from '../../person/dto/create-legal-person.dto';

export class CreateInsurerDto {
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

    @IsOptional()
    @ValidateNested()
    @Type(() => CreateLegalPersonDto)
    legalPerson?: CreateLegalPersonDto;

    @IsOptional()
    @IsUUID()
    legalPersonId?: string;
}
