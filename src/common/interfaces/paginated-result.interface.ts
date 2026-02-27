/**
 * Interfaz genérica para respuestas paginadas.
 * Todos los endpoints paginados deben retornar este formato.
 */
export interface PaginatedResult<T> {
    data: T[];
    meta: PaginationMeta;
}

export interface PaginationMeta {
    /** Total de registros sin paginar */
    total: number;
    /** Página actual (1-based) */
    page: number;
    /** Cantidad de items por página */
    limit: number;
    /** Última página disponible */
    totalPages: number;
    /** ¿Hay página anterior? */
    hasPreviousPage: boolean;
    /** ¿Hay página siguiente? */
    hasNextPage: boolean;
}
