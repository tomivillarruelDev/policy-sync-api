# Historial de Configuración del Proyecto (Stack Base)

Esta sección documenta los pasos realizados para crear la base de este backend utilizando NestJS. Sirve como referencia de la arquitectura y librerías instaladas.

## Tecnologías Principales
*   **Framework**: NestJS
*   **Base de Datos**: PostgreSQL + TypeORM
*   **Validación**: Joi, class-validator, class-transformer
*   **Seguridad**: JWT, Passport, Bcrypt
*   **Documentación**: Swagger

## Pasos de Construcción (Referencia)

1.  **Inicialización**: Proyecto creado con `nest new`.
2.  **Configuración**: Variables de entorno con `@nestjs/config` y validación con `joi`.
3.  **Base de Datos**: Configuración de TypeORM con PostgreSQL.
4.  **Rutas**: Prefijo global `api/v1`.
5.  **Pipes Globales**: `ValidationPipe` con `whitelist` y `transform` activados.
6.  **Paginación**: Implementación de DTOs base reutilizables.
7.  **CORS**: Habilitado para orígenes flexibles.
8.  **Archivos**: Soporte para carga con Multer.
9.  **Autenticación**:
    *   Setup de `AuthModule` con JWT y Passport.
    *   Decoradores: `@Auth`, `@GetUser`, `@RoleProtected`.
    *   Guards: `UserRoleGuard`.
10. **Swagger**: Configuración de documentación automática en `/docs`.
11. **Manejo de Errores**: Filtros de excepción globales.
12. **Caché**: Implementación de estrategias de caché con `CacheModule`.
