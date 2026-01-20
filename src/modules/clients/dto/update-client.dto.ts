import { PartialType } from '@nestjs/swagger';
import { CreateClientDto } from './create-client.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateClientDto extends PartialType(CreateClientDto) {
    @IsOptional()
    @IsUUID()
    realPersonId?: string;
}
