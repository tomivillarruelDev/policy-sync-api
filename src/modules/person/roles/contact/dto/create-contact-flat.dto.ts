import { IsOptional, IsUUID } from 'class-validator';
import { CreateRealPersonDto } from '../../../dto/create-real-person.dto';

export class CreateContactFlatDto extends CreateRealPersonDto {
  @IsOptional()
  @IsUUID()
  legalPersonId?: string;
}
