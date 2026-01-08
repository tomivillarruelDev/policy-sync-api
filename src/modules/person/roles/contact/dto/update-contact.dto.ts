import { PartialType } from '@nestjs/mapped-types';
import { CreateContactDto } from './create-contact.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateContactDto extends PartialType(CreateContactDto) {
    @IsOptional()
    @IsUUID()
    realPersonId?: string;
}
