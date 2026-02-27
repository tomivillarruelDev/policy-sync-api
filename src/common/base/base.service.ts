import {
    Repository,
    DeepPartial,
    FindManyOptions,
    FindOneOptions,
    ObjectLiteral,
} from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../dtos/pagination.dto';
import { PaginatedResult } from '../interfaces/paginated-result.interface';

export abstract class BaseService<T extends ObjectLiteral, R = T> {
    protected constructor(protected readonly repository: Repository<T>) { }

    async findAll(options?: FindManyOptions<T>): Promise<R[]> {
        const records = await this.repository.find(options);
        return records as unknown as R[];
    }

    /**
     * Busca todos los registros con paginación.
     * - Si NO se envían `page` ni `limit`, devuelve TODOS los registros (sin paginación).
     * - Si se envían, usa `findAndCount` de TypeORM para obtener datos + total en una sola query.
     *
     * @param paginationDto - Parámetros de paginación (page, limit)
     * @param options       - Opciones adicionales de TypeORM (relations, where, order, etc.)
     * @returns PaginatedResult<R> con data[] y meta (total, page, limit, totalPages, etc.)
     */
    async findAllPaginated(
        paginationDto: PaginationDto,
        options?: FindManyOptions<T>,
    ): Promise<PaginatedResult<R>> {
        // Sin parámetros de paginación → devolver todos los registros
        if (paginationDto.page === undefined && paginationDto.limit === undefined) {
            const [records, total] = await this.repository.findAndCount(options);
            return {
                data: records as unknown as R[],
                meta: {
                    total,
                    page: 1,
                    limit: total,
                    totalPages: 1,
                    hasPreviousPage: false,
                    hasNextPage: false,
                },
            };
        }

        const page = paginationDto.page ?? 1;
        const limit = paginationDto.limit ?? 10;
        const skip = (page - 1) * limit;

        const [records, total] = await this.repository.findAndCount({
            ...options,
            take: limit,
            skip,
        });

        const totalPages = Math.ceil(total / limit);

        return {
            data: records as unknown as R[],
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasPreviousPage: page > 1,
                hasNextPage: page < totalPages,
            },
        };
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
