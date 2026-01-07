# Policy Sync API

Backend API construido con **NestJS** y **PostgreSQL**, diseñado para la sincronización y gestión de pólizas, con un modelo robusto de personas y roles.

## 📚 Documentación

La documentación del proyecto se encuentra organizada en la carpeta `docs/`.

*   **[Guía de Configuración y Ejecución](docs/SETUP.md)**: Instrucciones para instalar dependencias, levantar la base de datos con Docker y ejecutar el servidor.
*   **[Modelo de Dominio](docs/DOMAIN_MODEL.md)**: Explicación detallada de la arquitectura de entidades (**Person**, **RealPerson**, **LegalPerson**) y el sistema de roles. **Lectura recomendada para entender la lógica de negocio.**
*   **[Historial del Stack](docs/PROJECT_HISTORY.md)**: Referencia de las tecnologías y configuraciones base aplicadas al proyecto.

## 🚀 Quick Start

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```
2.  **Levantar Base de Datos (Docker)**:
    ```bash
    docker-compose up -d
    ```
3.  **Configurar Entorno**:
    Copiar `.env.example` a `.env` y ajustar credenciales (ver [SETUP.md](docs/SETUP.md)).
4.  **Iniciar Servidor**:
    ```bash
    npm run start:dev
    ```
5.  **Ver Documentación de API**:
    Visitar `http://localhost:3000/docs` una vez que el servidor esté corriendo.

## 🛠 Stack Tecnológico

*   NestJS
*   TypeORM (PostgreSQL)
*   Docker & Docker Compose
*   Swagger (OpenAPI)
*   Passport (JWT Auth)