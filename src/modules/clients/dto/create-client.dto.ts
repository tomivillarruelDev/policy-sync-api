import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ToUpperCase } from '../../../common/transformers/text.transformers';
import { CreateRealPersonDto } from '../../person/dto/create-real-person.dto';

export class CreateClientDto extends CreateRealPersonDto {
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
