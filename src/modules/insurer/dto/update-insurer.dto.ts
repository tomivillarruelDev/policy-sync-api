import { PartialType } from '@nestjs/mapped-types';
import { CreateInsurerDto } from './create-insurer.dto';

export class UpdateInsurerDto extends PartialType(CreateInsurerDto) { }
