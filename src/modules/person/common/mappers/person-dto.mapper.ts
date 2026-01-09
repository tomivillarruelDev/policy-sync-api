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
            emails: person?.emails || [],
            phoneNumbers: person?.phoneNumbers || [],
            addresses: person?.addresses || [],
            identifications: person?.identifications || [],
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
