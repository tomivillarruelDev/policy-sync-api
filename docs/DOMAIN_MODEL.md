# Modelo de Dominio y Arquitectura de Entidades

Este documento describe el modelo de datos central del proyecto, enfocado en la gestión de Personas (Físicas y Jurídicas) y sus Roles dentro del sistema.

## 1. Jerarquía de Personas (People)

El sistema utiliza un patrón de herencia para manejar identidades. La entidad base es **Person**, la cual nunca se utiliza de forma aislada, sino que siempre se especializa en una Persona Física o Jurídica.

### Estructura Base

*   **Person (`people`)**: Entidad abstracta base.
    *   Contiene el ID único (UUID).
    *   Actúa como el nodo central para relacionar datos de contacto (teléfonos, emails, direcciones) e identificaciones.
    *   **Tablas relacionadas**: `addresses`, `emails`, `phone_numbers`, `identifications`.

### Subtipos

Cada registro en `people` debe tener una correspondencia en una de las siguientes tablas de subtipo:

1.  **RealPerson (`real_people`)**: Datos de persona física.
    *   Campos: `firstname`, `lastname`, `dni`, etc.
    *   Relación: FK `person_id` -> `people.id`.

2.  **LegalPerson (`legal_people`)**: Datos de persona jurídica (empresas).
    *   Campos: `organizationName`, `socialReason`, etc.
    *   Relación: FK `person_id` -> `people.id`.

## 2. Roles del Sistema

Los roles definen qué función cumple una persona en el negocio. Una misma `Person` puede tener múltiples roles sin duplicar su información base.

### Roles Generales
Estos roles pueden ser asignados tanto a Personas Físicas como Jurídicas:

*   **Contact (`contacts`)**: Contactos generales.
*   **Agent (`agents`)**: Agentes o intermediarios (ej. Brokers).

### Roles Exclusivos de Personas Jurídicas
Estos roles solo pueden asignarse si la persona es una `LegalPerson`:

*   **Company (`companies`)**: Empresas en el sistema.
*   **Insurer (`insurers`)**: Aseguradoras.

### Roles Específicos
*   **Client (`clients`)**:
    *   Tabla con `client.id` y `person_id`.
    *   Permite separar el catálogo de clientes de la información personal base.

## 3. Flujos de Creación de Datos

### Flujo Básico: Crear una Persona
Siempre se sigue un proceso en cascada, idealmente dentro de una transacción:

1.  **Insertar en `people`**: Genera el UUID base.
2.  **Insertar Subtipo**: Crear registro en `real_people` o `legal_people` usando el UUID del paso 1.
3.  **Insertar Datos Relacionados**: Agregar direcciones, teléfonos, etc., vinculados al UUID base.
4.  **Asignar Rol (Opcional)**: Crear registro en la tabla del rol (ej. `agents`, `clients`) vinculando al UUID base.

### Ejemplo: Crear un Agente (Persona Física)
Supongamos que creamos al agente "Juan Pérez":

1.  `people`: `{ id: 'uuid-1' }`
2.  `real_people`: `{ id: 'uuid-2', person_id: 'uuid-1', firstname: 'Juan', lastname: 'Pérez' }`
3.  `agents`: `{ id: 'uuid-3', person_id: 'uuid-1', role: 'broker' }`
4.  `addresses`: `{ id: 'uuid-4', person_id: 'uuid-1', street: 'Calle Falsa 123' }`

### Ejemplo: Crear una Empresa (Negocio)
Flujo para un formulario de "Nuevo Negocio":

1.  Crear `people` (datos de contacto básicos).
2.  Crear `legal_people` (Razón Social, CUIT).
3.  Crear `business` (o rol correspondiente) referenciando a `legal_people.id` o `people.id` según diseño específico.

> **Nota**: `Business` suele ser una FK a `LegalPerson`.

## 4. Gestión de Direcciones (Addresses)

El modelo de direcciones está normalizado para mantener consistencia geográfica.

**Flujo de API sugerido para Frontend:**
1.  **Seleccionar País**: `GET /countries` -> Usuario elige País.
2.  **Seleccionar Estado**: `GET /states?countryId={id}` -> Usuario elige Estado/Provincia.
3.  **Seleccionar Ciudad**: `GET /cities?stateId={id}` -> Usuario elige Ciudad.
4.  **Guardar**:
    *   El Frontend envía `cityId` junto con la calle y altura al endpoint de creación (`POST /address` o dentro del DTO de creación de persona).
    *   El Backend guarda la dirección relacionándola con la `Person` y la `City`.
