import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateAgentDto } from './create-agent.dto';
import { ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateRealPersonDto } from '../../../dto/update-real-person.dto';

export class UpdateAgentDto extends PartialType(OmitType(CreateAgentDto, ['realPerson'])) {
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateRealPersonDto)
    realPerson?: UpdateRealPersonDto;
}
