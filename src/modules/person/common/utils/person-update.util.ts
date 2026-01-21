import { Person } from '../../entities/person.entity';
import { CreatePersonDto } from '../../dto/create-person.dto';
import { Email } from '../../entities/email.entity';
import { Identification } from '../identification/entity/identification.entity';
import { PhoneNumber } from '../phone-number/entities/phone-number.entity';
import { Address } from '../address/entities/addresses.entity';
import { IdentificationType } from '../identification/entity/identification-type.entity';

export function updatePersonFields(
  person: Person,
  dto: Partial<CreatePersonDto>,
) {
  if (!dto) return;

  if (dto.emails) {
    person.emails = updateCollection(
      person.emails,
      dto.emails as any[],
      (existing, incoming) =>
        existing.account?.trim().toLowerCase() === incoming.account?.trim().toLowerCase(),
      (incoming) => createEmail(incoming, person),
      (existing, incoming) => {
        existing.account = incoming.account;
        existing.person = person;
      },
    );
  }

  if (dto.phoneNumbers) {
    person.phoneNumbers = updateCollection(
      person.phoneNumbers,
      dto.phoneNumbers as any[],
      (existing, incoming) =>
        existing.number?.trim() === incoming.number?.trim(),
      (incoming) => createPhoneNumber(incoming, person),
      (existing, incoming) => {
        existing.number = incoming.number;
        existing.person = person;
      },
    );
  }

  if (dto.addresses) {
    person.addresses = updateCollection(
      person.addresses,
      dto.addresses as any[],

      (existing, incoming) =>
        existing.street?.trim().toLowerCase() === incoming.street?.trim().toLowerCase() &&
        existing.streetNumber?.trim() === incoming.streetNumber?.trim(),
      (incoming) => createAddress(incoming, person),
      (existing, incoming) => updateAddress(existing, incoming, person),
    );
  }

  if (dto.identifications) {
    person.identifications = updateCollection(
      person.identifications,
      dto.identifications as any[],
      (existing, incoming) => {
        const valMatch = existing.value?.trim() === incoming.value?.trim();
        const typeMatch = existing.type?.id === incoming.typeId;
        return valMatch && typeMatch;
      },
      (incoming) => createIdentification(incoming, person),
      (existing, incoming) => updateIdentification(existing, incoming, person),
    );
  }
}



function createEmail(dto: any, person: Person): Email {
  const e = new Email();
  e.account = dto.account;
  e.person = person;
  return e;
}

function createPhoneNumber(dto: any, person: Person): PhoneNumber {
  const p = new PhoneNumber();
  p.number = dto.number;
  p.person = person;
  return p;
}

function createAddress(dto: any, person: Person): Address {
  const a = new Address();
  a.street = dto.street;
  a.streetNumber = dto.streetNumber || '';
  a.apartment = dto.apartment || '';
  a.zipCode = dto.zipCode || '';
  a.city = dto.cityId ? ({ id: dto.cityId } as any) : null;
  a.person = person;
  a.personId = person.id;
  return a;
}

function updateAddress(existing: Address, dto: any, person: Person) {
  existing.street = dto.street;
  existing.streetNumber = dto.streetNumber || '';
  existing.apartment = dto.apartment || '';
  existing.zipCode = dto.zipCode || '';
  existing.city = dto.cityId ? ({ id: dto.cityId } as any) : null;
  existing.person = person;
  existing.personId = person.id;
}

function createIdentification(dto: any, person: Person): Identification {
  const i = new Identification();
  i.value = dto.value;
  i.type = { id: dto.typeId } as IdentificationType;
  i.person = person;
  return i;
}

function updateIdentification(
  existing: Identification,
  dto: any,
  person: Person,
) {
  existing.value = dto.value;
  existing.type = { id: dto.typeId } as IdentificationType;
  existing.person = person;
}



/**
 * Generic helper to update a collection of entities.
 */
function updateCollection<T, D>(
  existingList: T[],
  newList: D[],
  matcher: (existing: T, incoming: D) => boolean,
  creator: (incoming: D) => T,
  updater: (existing: T, incoming: D) => void,
): T[] {
  if (!newList) return existingList;
  if (!existingList) existingList = [];

  const result: T[] = [];

  for (const incoming of newList) {
    const existing = existingList.find((e) => matcher(e, incoming));

    if (existing) {
      updater(existing, incoming);
      result.push(existing);
    } else {
      result.push(creator(incoming));
    }
  }

  return result;
}
