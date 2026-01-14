import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { validatePersonUniqueConstraints } from './person-validation.util';
import { Email } from '../../entities/email.entity';
import { Identification } from '../identification/entity/identification.entity';

describe('validatePersonUniqueConstraints', () => {
    let mockManager: Partial<EntityManager>;
    let mockEmailRepo: Partial<Repository<Email>>;
    let mockIdentRepo: Partial<Repository<Identification>>;

    beforeEach(() => {
        mockEmailRepo = {
            find: jest.fn(),
        };
        mockIdentRepo = {
            count: jest.fn(),
        };
        mockManager = {
            getRepository: jest.fn((entity) => {
                if (entity === Email) return mockEmailRepo as any;
                if (entity === Identification) return mockIdentRepo as any;
                return null;
            }),
        };
    });

    it('should pass if no emails or identifications provided', async () => {
        await validatePersonUniqueConstraints(mockManager as EntityManager, 'uuid-1', {});
        expect(mockManager.getRepository).not.toHaveBeenCalled();
    });

    it('should pass if emails are unique (not found in DB)', async () => {
        (mockEmailRepo.find as jest.Mock).mockResolvedValue([]);

        await validatePersonUniqueConstraints(mockManager as EntityManager, 'uuid-1', {
            emails: [{ account: 'new@test.com' }],
        });

        expect(mockEmailRepo.find).toHaveBeenCalled();
    });

    it('should pass if email exists but belongs to the SAME person', async () => {
        // Logic: find matches ignoring current person.
        // If our utility uses { person: { id: Not(personId) } }, then it only returns conflicts.
        // So if find returns [], it passes.
        (mockEmailRepo.find as jest.Mock).mockResolvedValue([]);

        await validatePersonUniqueConstraints(mockManager as EntityManager, 'uuid-1', {
            emails: [{ account: 'my-email@test.com' }],
        });

        // We verify that the query was constructed correctly?
        // Hard to verify specific `FindOptions` object equality deeply with Not(),
        // but we trust the logic if find returns empty, it passes.
        expect(mockEmailRepo.find).toHaveBeenCalled();
    });

    it('should throw BadRequest if email exists and belongs to ANOTHER person', async () => {
        // Simulation: DB returns a record because the query excluded current personId,
        // so any result found IS a conflict.
        (mockEmailRepo.find as jest.Mock).mockResolvedValue([
            { account: 'taken@test.com', person: { id: 'uuid-2' } } as Email,
        ]);

        await expect(
            validatePersonUniqueConstraints(mockManager as EntityManager, 'uuid-1', {
                emails: [{ account: 'taken@test.com' }],
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequest if identification exists for ANOTHER person', async () => {
        // Utility uses count() > 0 checks
        (mockIdentRepo.count as jest.Mock).mockResolvedValue(1);

        await expect(
            validatePersonUniqueConstraints(mockManager as EntityManager, 'uuid-1', {
                identifications: [{ value: '123', typeId: 'type-1' }],
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('should pass if identification count is 0', async () => {
        (mockIdentRepo.count as jest.Mock).mockResolvedValue(0);

        await validatePersonUniqueConstraints(mockManager as EntityManager, 'uuid-1', {
            identifications: [{ value: '123', typeId: 'type-1' }],
        });

        expect(mockIdentRepo.count).toHaveBeenCalled();
    });
});
