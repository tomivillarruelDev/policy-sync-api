import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateInsurerDto } from './create-insurer.dto';
import { ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateLegalPersonDto } from '../../person/dto/update-legal-person.dto';

export class UpdateInsurerDto extends PartialType(OmitType(CreateInsurerDto, ['legalPerson'])) {
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateLegalPersonDto)
    legalPerson?: UpdateLegalPersonDto;
}
