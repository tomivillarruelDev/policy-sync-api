import { PartialType } from '@nestjs/swagger';
import { CreateRealPersonDto } from './create-real-person.dto';

export class UpdateRealPersonDto extends PartialType(CreateRealPersonDto) {}
