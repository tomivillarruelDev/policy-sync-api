import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { CreateContactDto } from './create-contact.dto';

export class UpdateContactDto extends PartialType(CreateContactDto) {
    @IsOptional()
    @IsUUID()
    realPersonId?: string;

    @IsOptional()
    @IsUUID()
    legalPersonId?: string;
}
