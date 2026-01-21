import { LegalPerson } from '../../entities/legal-person.entity';
import { RealPerson } from '../../entities/real-person.entity';
import { Person } from '../../entities/person.entity';
import { mapAddressToResponseDto } from './address.mapper';
import { Gender } from '../../entities/gender.entity';


export interface FlatPersonDto {
  emails: any[];
  phoneNumbers: any[];
  addresses: any[];
  identifications: any[];
  organizationName?: string | null;
  socialReason?: string | null;
  website?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  maternalLastName?: string | null;
  nationality?: string | null;
  nationalityId?: string | null;
  birthDate?: Date | null;
  gender?: Gender | null;
  genderId?: string | null;
  civilStatusId?: string | null;
}

export class PersonDtoMapper {
  static toFlatDto(entity: LegalPerson | RealPerson): FlatPersonDto {
    if (!entity)
      return {
        emails: [],
        phoneNumbers: [],
        addresses: [],
        identifications: [],
      };

    const person = entity.person;

    const base = {
      emails:
        person?.emails?.map((e) => ({ id: e.id, account: e.account })) || [],
      phoneNumbers:
        person?.phoneNumbers?.map((p) => ({ id: p.id, number: p.number })) ||
        [],
      addresses:
        person?.addresses?.map((a) => mapAddressToResponseDto(a)) || [],
      identifications:
        person?.identifications?.map((i) => ({
          id: i.id,
          value: i.value,
          type: i.type ? { id: i.type.id, name: i.type.name } : null,
        })) || [],
    };

    if (entity instanceof RealPerson) {
      return {
        ...base,
        firstName: entity.firstName,
        lastName: entity.lastName,
        middleName: entity.middleName,
        maternalLastName: entity.maternalLastName,
        nationality: entity.nationality?.name,
        nationalityId: entity.nationalityId,
        birthDate: entity.birthDate,

        genderId: entity.genderId || entity.gender?.id,
        civilStatusId: entity.civilStatusId || entity.civilStatus?.id,
      };
    }

    if (entity instanceof LegalPerson) {
      return {
        ...base,
        organizationName: entity.organizationName,
        socialReason: entity.socialReason,
        website: entity.website,
      };
    }

    return base;
  }
}
