import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateLegalPersonDto } from '../../../dto/create-legal-person.dto';

// Crea Person + LegalPerson + Business en una sola request
export class CreateBusinessFromScratchDto {
  // Datos de la persona jurídica (orgName, website, etc). Extiende CreatePersonDto en el backend
  @ValidateNested()
  @Type(() => CreateLegalPersonDto)
  legal: CreateLegalPersonDto;
}
