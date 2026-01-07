# Guía de Configuración y Ejecución

## Prerrequisitos
*   Node.js (LTS)
*   Docker & Docker Compose
*   NestJS CLI (Opcional, recomendado): `npm i -g @nestjs/cli`

## Instalación

1.  Clonar el repositorio.
2.  Instalar dependencias:
    ```bash
    npm install
    ```

## Configuración de Entorno

1.  Copiar el archivo de ejemplo:
    ```bash
    cp .env.example .env
    ```
2.  Configurar las variables de entorno en `.env`. Valores por defecto sugeridos para desarrollo:

    ```ini
    # Database Configuration
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=root
    DB_PASSWORD=root
    DB_NAME=gestures_ai

    # JWT Configuration
    JWT_SECRET=tu_clave_secreta_aqui

    # Application Configuration
    PORT=3000
    STAGE=dev
    ```

## Base de Datos (PostgreSQL)

El proyecto utiliza PostgreSQL y se incluye un archivo `docker-compose.yaml` para levantar el entorno localmente.

### Iniciar Base de Datos
Ejecutar el siguiente comando para levantar PostgreSQL y pgAdmin:

```bash
docker-compose up -d
```

Esto iniciará:
*   **PostgreSQL**: Puerto `5432`
*   **pgAdmin**: Puerto `8080` (Panel de administración)

### Acceso a pgAdmin
*   **URL**: http://localhost:8080
*   **Email**: admin@admin.com
*   **Password**: root

## Ejecución del Servidor

### Modo Desarrollo
```bash
npm run start:dev
```

### Modo Producción
```bash
npm run build
npm run start:prod
```

## Documentación API (Swagger)

Una vez iniciado el servidor, puedes acceder a la documentación interactiva en:

*   URL: http://localhost:3000/docs
