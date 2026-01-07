import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateInsurerDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    documentType: string;

    @IsString()
    @IsNotEmpty()
    documentNumber: string;

    @IsString()
    @IsOptional()
    executive?: string;

    @IsString()
    @IsOptional()
    agencyNumber?: string;

    // Se recibe el ID del pais, se validará en el servicio o pipe
    @IsString()
    @IsOptional()
    countryId?: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsUrl()
    @IsOptional()
    website?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    landline?: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsUrl()
    @IsOptional()
    logoUrl?: string;
}
