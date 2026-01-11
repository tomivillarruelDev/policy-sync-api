import { PersonType } from '../../enums/person-type.enum';
import { mapPersonData } from './person.mapper';
import { CreatePersonDto } from '../../dto/create-person.dto';
import { UpdatePersonDto } from '../../dto/update-person.dto';

describe('mapPersonData', () => {
    const existingPersonId = 'existing-uuid';

    it('should map create DTO correctly (creation flow)', () => {
        const dto: CreatePersonDto = {
            emails: [{ account: 'test@example.com' } as any],
            phoneNumbers: [{ number: '123456789' } as any],
            addresses: [{ street: 'Main St', cityId: 'city-uuid', streetNumber: '123' } as any],
            identifications: [{ value: '12345', typeId: 'type-uuid' } as any],
        } as any;

        const result = mapPersonData(dto, PersonType.REAL);

        expect(result).toBeDefined();
        expect(result!.id).toBeUndefined(); // No ID on creation
        expect(result!.emails).toHaveLength(1);
        expect(result!.emails[0].person).toBe(result); // Circular link
        expect(result!.addresses).toHaveLength(1);
        expect(result!.addresses[0].city).toBeDefined();
        expect(result!.addresses[0].city!.id).toBe('city-uuid');
        // Ensure nested "any" cast didn't crash
    });

    it('should map update DTO with existing ID correctly (update flow)', () => {
        const dto: UpdatePersonDto = {
            // simulate update DTO having items with IDs
            emails: [{ id: 'email-uuid', account: 'updated@example.com' } as any],
            addresses: [{ id: 'addr-uuid', street: 'Updated St', cityId: 'city-uuid' } as any],
        };

        const result = mapPersonData(dto, PersonType.LEGAL, existingPersonId);

        expect(result).toBeDefined();
        expect(result!.id).toBe(existingPersonId); // Should have the ID
        expect(result!.emails).toHaveLength(1);
        expect(result!.emails[0].id).toBe('email-uuid');
        expect(result!.emails[0].person).toBe(result);

        expect(result!.addresses).toHaveLength(1);
        expect(result!.addresses[0].id).toBe('addr-uuid');
        expect(result!.addresses[0].person).toBe(result);
    });

    it('should handle missing cityId in address update gracefully', () => {
        const dto: UpdatePersonDto = {
            addresses: [{ id: 'addr-uuid', street: 'Updated St' } as any], // no cityId
        };

        const result = mapPersonData(dto, PersonType.LEGAL, existingPersonId);

        expect(result!.addresses[0].city).toBeUndefined(); // Should not be null
    });
});
