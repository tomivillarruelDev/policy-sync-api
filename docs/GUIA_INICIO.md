# Guía de Inicio y Verificación

## Requisitos Previos
*   Node.js (LTS)
*   Docker & Docker Compose

## 1. Instalación y Configuración

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Configurar Variables de Entorno:**
    Copia el archivo de ejemplo y ajústalo (especialmente si cambiaste credenciales en Docker):
    ```bash
    cp .env.example .env
    ```
    *Nota: Asegúrate de que `DB_NAME` en `.env` coincida con `POSTGRES_DB` en `docker-compose.yaml`.*

3.  **Levantar Base de Datos (Docker):**
    ```bash
    docker-compose up -d
    ```
    Esto iniciará PostgreSQL (puerto 5432) y pgAdmin (puerto 8080).

## 2. Ejecución del Proyecto

### Modo Desarrollo
```bash
npm run start:dev
```
La API estará disponible en `http://localhost:3000`.
Documentación Swagger: `http://localhost:3000/docs`.

## 3. Verificación Automática (Seeding)

Este proyecto incluye un script de **Verificación Completa (Full Flow)** que puebla la base de datos con un escenario de prueba real, validando la integridad de todos los módulos principales.

### Ejecutar Verificación
```bash
npm run seed:verify
```

### ¿Qué hace este comando?
Ejecuta la secuencia `CatalogVerificationSeeder`, que realiza lo siguiente:
1.  **Catálogos:** Crea una Aseguradora, un Producto y un Plan.
2.  **Clientes:** Crea una `RealPerson` con todos sus datos (Direcciones, Emails, Teléfonos, Identificaciones) para actuar como Cliente.
3.  **Agentes:** Crea una `RealPerson` y le asigna el rol de `Agent` (vinculando ambas entidades).
4.  **Pólizas:** Crea una `Policy` completa, vinculando al Cliente, el Agente y el Plan, e insertando `PolicyDependents` en cascada.
5.  **Pruebas de Actualización:**
    *   Modifica el nombre del Plan.
    *   Desactiva al Agente.
    *   Actualiza el monto asegurado de la Póliza.
    *   *Verifica que todos los cambios persistan correctamente.*

Si el comando finaliza con **"--- Verificación Completa Exitosamente ---"**, el núcleo del sistema está funcionando al 100%.

## 4. Comandos Adicionales
*   `npm run build`: Compilar para producción.
*   `npm run typeorm:migration:run`: Ejecutar migraciones (si aplica).
