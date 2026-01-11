import { CreatePersonDto } from '../../dto/create-person.dto';
import { UpdatePersonDto } from '../../dto/update-person.dto';
import { PersonType } from '../../enums/person-type.enum';
import { Person } from '../../entities/person.entity';
import { Email } from '../../entities/email.entity';
import { PhoneNumber } from '../../common/phone-number/entities/phone-number.entity';
import { Address } from '../../common/address/entities/addresses.entity';
import { Identification } from '../../common/identification/entity/identification.entity';
import { IdentificationType } from '../../common/identification/entity/identification-type.entity';

// Helper type to safely access ID if it exists
type DtoWithId = { id?: string };

export function mapPersonData(
  dto: CreatePersonDto | UpdatePersonDto,
  type: PersonType,
  existingPersonId?: string,
): Person | undefined {
  if (!dto) return undefined;

  const person = new Person();
  if (existingPersonId) {
    person.id = existingPersonId;
  }
  person.type = type;

  // Generic helper to map collection
  const mapCollection = <T extends { person: Person; id?: string }, D>(
    items: D[] | undefined,
    EntityClass: new () => T,
    mapper: (entity: T, itemDto: D) => void
  ): T[] | undefined => {
    if (!items || !Array.isArray(items)) return undefined;

    return items.map((itemDto) => {
      const entity = new EntityClass();
      mapper(entity, itemDto);

      // Handle ID safely
      const itemWithId = itemDto as unknown as DtoWithId;
      if (itemWithId.id) {
        entity.id = itemWithId.id;
      }

      entity.person = person; // Circular link required for cascade
      return entity;
    });
  };

  person.emails = mapCollection(dto.emails, Email, (e, d) => {
    e.account = d.account;
  }) || [];

  person.phoneNumbers = mapCollection(dto.phoneNumbers, PhoneNumber, (p, d) => {
    p.number = d.number;
  }) || [];

  person.addresses = mapCollection(dto.addresses, Address, (a, d) => {
    a.street = d.street;
    a.streetNumber = d.streetNumber || '';
    a.apartment = d.apartment || '';
    a.zipCode = d.zipCode || '';
    // Safe check for cityId
    if (d.cityId) {
      // Using partial type assertion is cleaner than 'as any'
      a.city = { id: d.cityId } as any;
    }
  }) || [];

  person.identifications = mapCollection(dto.identifications, Identification, (i, d) => {
    i.value = d.value;
    i.type = { id: d.typeId } as IdentificationType;
  }) || [];

  return person;
}