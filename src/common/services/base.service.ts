import { Repository, ObjectLiteral } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

export abstract class BaseService<T extends ObjectLiteral> {
    protected constructor(protected readonly repository: Repository<T>) { }

    async remove(id: string): Promise<void> {
        // Check if exists first (optional but good for specific error)
        // softDelete won't throw if not found, it just returns affected: 0
        const result = await this.repository.softDelete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Entity with id ${id} not found`);
        }
    }
}
