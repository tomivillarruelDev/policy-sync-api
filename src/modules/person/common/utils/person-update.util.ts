import { Person } from '../../entities/person.entity';
import { CreatePersonDto } from '../../dto/create-person.dto';
import { mapAddressDto, mapIdentificationDto } from '../mappers';

/**
 * Updates a Person entity with data from a DTO.
 * Since orphanedRowAction: 'delete' is enabled on Person relations, replacing the arrays
 * will automatically delete the old records that are not in the new list.
 */
export function updatePersonFields(person: Person, dto: Partial<CreatePersonDto>) {
    if (!dto) return;

    // Update simple fields if any (Currently Person only has type which is usually immutable after creation, but if needed:)
    // if (dto.type) person.type = dto.type; 

    // Update Relations
    // For each relation, if it exists in the DTO, we replace the entity's list.
    // Because the DTOs are "Create" DTOs (without IDs), this logic acts as a full replacement.
    // If the user wanted to "add" one, they would need to send the existing ones + the new one,
    // OR we would need logic to merge. Given the DTO structure, replacement is the safest and likely intended behavior.

    if (dto.emails) {
        person.emails = dto.emails.map(e => {
            // We map directly because Email entity structure matches DTO mostly, 
            // but we should ensure it's a clean object or use a mapper if one exists.
            // DTO: { email: string, category: enum }
            // Entity: { email: string, category: enum }
            // Direct assignment works for simple DTOs.
            return e as any;
        });
    }

    if (dto.phoneNumbers) {
        person.phoneNumbers = dto.phoneNumbers.map(p => p as any);
    }

    if (dto.addresses) {
        person.addresses = mapAddressDto(dto.addresses) as any[];
    }

    if (dto.identifications) {
        person.identifications = mapIdentificationDto(dto.identifications) as any[];
    }
}
