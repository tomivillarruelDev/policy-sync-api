import { CreatePersonDto } from '../../dto/create-person.dto';
import { UpdatePersonDto } from '../../dto/update-person.dto';
import { PersonType } from '../../enums/person-type.enum';
import { mapAddressDto, mapIdentificationDto } from './';

export function mapPersonData(dto: CreatePersonDto | UpdatePersonDto, type: PersonType) {
  if (!dto) return undefined;

  const result: any = {
    type: type,
  };

  // Solo mapear los campos que están definidos (para updates parciales)
  if (dto.emails !== undefined) {
    // Para emails, crear entidades que TypeORM pueda manejar
    result.emails = dto.emails.map(emailDto => ({
      account: emailDto.account,
      // Si el DTO tiene ID, preservarlo para actualización
      ...(emailDto as any).id && { id: (emailDto as any).id }
    }));
  }

  if (dto.phoneNumbers !== undefined) {
    // Para phoneNumbers, crear entidades que TypeORM pueda manejar
    result.phoneNumbers = dto.phoneNumbers.map(phoneDto => ({
      number: phoneDto.number,
      // Si el DTO tiene ID, preservarlo para actualización
      ...(phoneDto as any).id && { id: (phoneDto as any).id }
    }));
  }

  if (dto.addresses !== undefined) {
    result.addresses = mapAddressDto(dto.addresses);
  }

  if (dto.identifications !== undefined) {
    result.identifications = mapIdentificationDto(dto.identifications);
  }

  return result;
}