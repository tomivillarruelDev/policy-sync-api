# Crear Backend Base con NestJS

A continuación se describe el paso a paso para crear una base sólida de backend utilizando NestJS.

## Pasos

1. **Inicializar el proyecto con NestJS CLI**  
   Instalar Nest CLI si no lo tenés:

   ```bash
   npm i -g @nestjs/cli
   nest new nombre-del-proyecto
   ```

2. **Configurar variables de entorno**  
   Instalar los paquetes necesarios:

   ```bash
   npm i @nestjs/config
   npm i joi
   ```

   - Usar `@nestjs/config` para manejar las variables de entorno.
   - Usar `joi` para definir un esquema de validación de dichas variables.
   - Crear el archivo `.env` y cargarlo en el módulo raíz (`AppModule`).

3. **Configuración base de la base de datos**

   - Instalar y configurar el paquete de base de datos (PostgreSQL con TypeORM):
     ```bash
     npm i @nestjs/typeorm typeorm pg
     npm i -D @types/pg
     ```
   - Configurar las credenciales en `.env`.
   - Integrar `TypeOrmModule` en el `AppModule`.

4. **Configurar prefijos de rutas globales**  
   Por ejemplo, agregar `api/v1` como prefijo:

   ```ts
   app.setGlobalPrefix('api/v1');
   ```

5. **Configurar los pipes a nivel global**  
   Activar la validación y transformación automática de los DTOs:

   ```ts
   app.useGlobalPipes(
     new ValidationPipe({
       whitelist: true,
       transform: true,
       transformOptions: {
         enableImplicitConversion: true,
       },
     }),
   );
   ```

6. **Instalar librerías para validación y transformación de DTOs**

   ```bash
   npm i class-validator class-transformer
   ```

7. **Implementar paginación reutilizable**

   - Crear un DTO base con propiedades como `page`, `limit`, `order`, etc.
   - Reutilizar este DTO en los controladores donde se necesite paginar datos.

8. **Habilitar y configurar CORS**

   ```ts
   app.enableCors({
     origin: '*', // Ajustar según tus necesidades
   });
   ```

9. **Cargar archivos usando Multer**

   - Instalar Multer:
     ```bash
     npm i @nestjs/platform-express multer
     ```
   - Usar el decorador `@UseInterceptors(FileInterceptor('file'))` para manejar archivos en controladores.

10. **Autenticación (Auth)**

- Instalar JWT y bcrypt:
  ```bash
  npm i @nestjs/jwt passport-jwt @nestjs/passport passport bcrypt
  ```
- Crear módulo de autenticación con estrategias JWT:

  - **AuthModule**: Configurado con `JwtModule` y `PassportModule`
  - **JwtStrategy**: Implementa `PassportStrategy` para validar tokens JWT
  - **UserSchema**: Modelo Mongoose con middleware para hash de contraseñas

- Decoradores personalizados:

  - **@Auth()**: Combina `UseGuards` con roles en un solo decorador
  - **@GetUser()**: Extrae el usuario autenticado o sus propiedades
  - **@RoleProtected()**: Protege rutas según roles de usuario

- Guards y protección de rutas:

  - **UserRoleGuard**: Verifica si el usuario tiene los roles requeridos
  - Proteger rutas completas: `@Auth(ValidRoles.admin)`
  - Proteger controladores: `@UseGuards(AuthGuard())`

- Endpoints típicos:
  - `/auth/register`: Registrar nuevos usuarios
  - `/auth/login`: Autenticar usuarios y generar tokens
  - `/auth/refresh`: Renovar tokens
  - `/auth/logout`: Cerrar sesión (cliente)

11. **Documentar la API con Swagger**

- Instalar Swagger:
  ```bash
  npm i @nestjs/swagger swagger-ui-express
  ```
- Configurar Swagger en el `main.ts`:
  ```ts
  const config = new DocumentBuilder()
    .setTitle('API Base')
    .setDescription('Documentación de la API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  ```

12. **Manejo global de excepciones**

- Crear un `GlobalExceptionFilter` para personalizar las respuestas de error.
- Usar `app.useGlobalFilters(new GlobalExceptionFilter())`.

13. **Implementar estrategias de caché**

- Activar el módulo de caché de NestJS:
  ```bash
  import { CacheModule } from '@nestjs/common';
  ```
- Configurar en el módulo raíz:

  ```ts
  CacheModule.register({
    ttl: 5, // segundos
    max: 100, // número máximo de elementos en caché

   @UseInterceptors(CacheInterceptor) // Aplica el interceptor a todas las rutas de este controlado
  });
  ```

## Base de Datos PostgreSQL

Este proyecto utiliza PostgreSQL como base de datos principal. Se ha migrado desde MongoDB para aprovechar las características relacionales y la robustez de PostgreSQL.

### Configuración Local con Docker

Para ejecutar PostgreSQL localmente, utiliza el archivo `docker-compose.yaml` incluido:

```bash
docker-compose up -d
```

Esto iniciará:

- **PostgreSQL** en el puerto `5432`
- **pgAdmin** en el puerto `8080` para administración visual

### Variables de Entorno

Copia el archivo `.env.example` a `.env` y configura las siguientes variables:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=root
DB_PASSWORD=root
DB_NAME=gestures_ai

# JWT Configuration
JWT_SECRET=your-secret-key-here

# Application Configuration
PORT=3000
STAGE=dev
```

### Acceso a pgAdmin

- URL: http://localhost:8080
- Email: admin@admin.com
- Password: root

### Entidades Migradas

Las siguientes entidades han sido migradas de Mongoose a TypeORM:

1. **User** (`src/auth/entities/user.entity.ts`)

   - Gestión de usuarios y autenticación
   - Encriptación automática de contraseñas
   - Roles de usuario

2. **Subtitle** (`src/subtitles/entities/subtitle.entity.ts`)
   - Gestión de archivos de subtítulos
   - Estados de procesamiento
   - Metadatos de archivos
