import {
    Repository,
    DeepPartial,
    FindManyOptions,
    FindOneOptions,
    ObjectLiteral,
} from 'typeorm';
import { NotFoundException } from '@nestjs/common';

export abstract class BaseService<T extends ObjectLiteral, R = T> {
    protected constructor(protected readonly repository: Repository<T>) { }

    async findAll(options?: FindManyOptions<T>): Promise<R[]> {
        const records = await this.repository.find(options);
        return records as unknown as R[];
    }

    async findOne(id: any, options?: FindOneOptions<T>): Promise<R> {
        const record = await this.repository.findOne({
            where: { id } as any,
            ...options,
        });

        if (!record) {
            throw new NotFoundException(`Entity with id ${id} not found`);
        }

        return record as unknown as R;
    }

    async create(entity: DeepPartial<T>): Promise<R> {
        const newEntity = this.repository.create(entity);
        const saved = await this.repository.save(newEntity);
        return saved as unknown as R;
    }

    async update(id: any, entity: DeepPartial<T>): Promise<R> {
        // Preload es útil para actualizaciones simples, pero para actualizaciones anidadas complejas 
        // podría manejarse mejor en el servicio específico. 
        // Aquí proporcionamos una implementación genérica segura.
        const preload = await this.repository.preload({
            id,
            ...entity,
        });

        if (!preload) {
            throw new NotFoundException(`Entity with id ${id} not found`);
        }

        const saved = await this.repository.save(preload);
        return saved as unknown as R;
    }

    async remove(id: any): Promise<void> {
        // Verificar existencia primero para lanzar NotFound si es necesario, o confiar en el resultado de la actualización
        // softDelete devuelve UpdateResult { generatedMaps: [], raw: [], affected: 1 }
        const result = await this.repository.softDelete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`Entity with id ${id} not found`);
        }
    }
}
