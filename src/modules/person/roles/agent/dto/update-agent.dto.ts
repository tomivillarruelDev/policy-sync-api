import { PartialType } from '@nestjs/mapped-types';
import { CreateAgentDto } from './create-agent.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateAgentDto extends PartialType(CreateAgentDto) {
  @IsOptional()
  @IsUUID()
  realPersonId?: string;
}
