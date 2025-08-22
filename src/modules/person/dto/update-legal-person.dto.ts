import { PartialType } from '@nestjs/swagger';
import { CreateLegalPersonDto } from './create-legal-person.dto';

export class UpdateLegalPersonDto extends PartialType(CreateLegalPersonDto) {}
