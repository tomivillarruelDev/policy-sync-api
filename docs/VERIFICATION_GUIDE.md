# Instrucciones de Verificación

Dado que no puedo ejecutar las pruebas directamente en tu entorno, aquí te explico cómo puedes verificar el arreglo:

## 1. Verificar `orphanedRowAction`
Identificaste correctamente que `orphanRemoval` estaba causando un error. `orphanedRowAction: 'delete'` es el equivalente correcto en TypeORM 0.3+. Esto asegura que si eliminas un elemento del array de `emails` (o cualquier otra relación) y guardas la entidad `Person`, TypeORM eliminará ese elemento de la base de datos.

## 2. Ejecutar Pruebas Existentes
Ejecuta la suite de pruebas de tu proyecto para asegurarte de que no haya regresiones:
```bash
npm test
```

## 3. Prueba CRUD Manual
Puedes usar Postman, Insomnia o curl para probar la lógica de actualización.

### Escenario: Actualizar RealPerson y Reemplazar Emails

1.  **Crear una RealPerson**
    ```json
    POST /real-people
    {
      "firstName": "Juan",
      "lastName": "Perez",
      "emails": [
        { "email": "viejo@ejemplo.com", "category": "WORK" }
      ]
    }
    ```
    *La respuesta debería darte un ID, ej: `uuid-1`.*

2.  **Actualizar la RealPerson (Reemplazar Email)**
    Envía una petición PATCH con una *nueva* lista de emails.
    ```json
    PATCH /real-people/uuid-1
    {
      "emails": [
        { "email": "nuevo@ejemplo.com", "category": "PERSONAL" }
      ]
    }
    ```

3.  **Verificar Resultado**
    -   Obtener la persona: `GET /real-people/uuid-1`
    -   Revisar `emails`. Debería contener SOLO `nuevo@ejemplo.com`.
    -   Revisar Base de Datos (opcional): La fila de `viejo@ejemplo.com` debería haber sido eliminada de la tabla `emails`.

### Escenario: Actualizar LegalPerson (Anidado en Business/Contact)
Intenta actualizaciones similares para `LegalPerson` y asegúrate de que `organizationName` se actualice Y los datos anidados de persona (direcciones, teléfonos) se actualicen correctamente.
