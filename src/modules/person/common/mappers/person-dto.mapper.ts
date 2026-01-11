import { LegalPerson } from "../../entities/legal-person.entity";
import { RealPerson } from "../../entities/real-person.entity";
import { Person } from "../../entities/person.entity";

export interface FlatPersonDto {
    emails: any[];
    phoneNumbers: any[];
    addresses: any[];
    identifications: any[];
    organizationName?: string;
    socialReason?: string;
    website?: string;
    firstName?: string;
    lastName?: string;
    // Add other fields as needed
}

export class PersonDtoMapper {
    static toFlatDto(entity: LegalPerson | RealPerson): FlatPersonDto {
        if (!entity) return {
            emails: [],
            phoneNumbers: [],
            addresses: [],
            identifications: []
        };

        const person = entity.person;

        const base = {
            emails: person?.emails?.map(e => ({ id: e.id, account: e.account })) || [],
            phoneNumbers: person?.phoneNumbers?.map(p => ({ id: p.id, number: p.number })) || [],
            addresses: person?.addresses?.map(a => ({
                id: a.id,
                street: a.street,
                streetNumber: a.streetNumber,
                apartment: a.apartment,
                zipCode: a.zipCode,
                city: a.city ? { id: a.city.id, name: a.city.name } : null
            })) || [],
            identifications: person?.identifications?.map(i => ({
                id: i.id,
                value: i.value,
                type: i.type ? { id: i.type.id, name: i.type.name } : null
            })) || [],
        };

        if (entity instanceof LegalPerson) {
            return {
                ...base,
                organizationName: entity.organizationName,
                socialReason: entity.socialReason,
                website: entity.website,
            };
        }

        // Handle RealPerson (future proofing)
        // if (entity instanceof RealPerson) { ... }

        return base;
    }
}
