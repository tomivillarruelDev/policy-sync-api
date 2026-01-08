# Documentación Técnica: Sistema de Seguros (Versión Portfolio MVP)

**Tecnologías:** NestJS + PostgreSQL + TypeORM

## 1. Resumen del Proyecto

El objetivo es desarrollar el backend de un sistema de gestión de seguros simplificado pero robusto. Esta versión "MVP" (Producto Mínimo Viable) se centra en el ciclo de vida de la venta de una póliza, demostrando buenas prácticas de arquitectura, manejo de bases de datos relacionales y validación de datos.

## 2. Alcance y Simplificaciones

Para adaptar el proyecto a un desarrollo unipersonal viable para portfolio, se han realizado los siguientes cambios estructurales:

*   **Base de Datos Relacional:** Se utiliza PostgreSQL con TypeORM para garantizar integridad referencial.
*   **Centralización en Policy:** Se eliminan módulos satélite innecesarios; datos como fechas y estados se integran directamente en la tabla `policies`.
*   **Sin Módulo Financiero Complejo:** Se excluyen cálculos complejos de comisiones y liquidaciones.
*   **Simplificación Comercial:** Existe una única entidad `Agent` que vende directamente, sin jerarquías de agencias.

---

## 3. Arquitectura de Base de Datos (Modelo de Dominio)

### A. Módulos de Catálogo (Configuración)

#### 1. Entity: Insurer (Aseguradora)
Representa la compañía que ofrece el seguro.
*   **Relación:** `OneToOne` con `LegalPerson` (hereda datos fiscales y de contacto).
*   **Campos propios:** `id`, `code` (Único), `executive`, `agencyNumber`, `logoUrl`.
*   **Relaciones:** `products` (OneToMany).

#### 2. Entity: Product (Producto)
Un tipo de seguro ofrecido (ej: "Automóvil", "Vida").
*   **Campos:** `id`, `name`, `code`, `branch` (Ramo), `insuredAmount` (Suma Orientativa), `specialBenefits`, `adminExpenses`.
*   **Relaciones:** `insurer` (ManyToOne).

#### 3. Entity: Plan (Plan)
Una variante comercial específica de un producto (ej: "Todo Riesgo con Franquicia").
*   **Campos:** `id`, `name`, `code`, `deductibleOne`, `deductibleTwo`.
*   **Relaciones:** `product` (ManyToOne).

---

### B. Módulos de Actores (Personas y Roles)

#### 4. Módulo: Person (Núcleo de Identidad)
Centraliza la información de cualquier entidad (física o jurídica) utilizando un patrón de composición.

*   **Entity Base: Person** (`people`)
    *   Interactúa con: `emails`, `phoneNumbers`, `addresses`, `identifications`.
    *   Campos universales: checks de privacidad (LOPDP).
    
*   **Subtipo: RealPerson (Persona Física)** (`real_people`)
    *   Datos biográficos: `firstName`, `lastName`, `birthDate`, `gender`, `civilStatus`, `nationality`.
    *   Relación: OneToOne con `Person`.

*   **Subtipo: LegalPerson (Persona Jurídica)** (`legal_people`)
    *   Datos empresariales: `organizationName`, `socialReason`, `website`.
    *   Relación: OneToOne con `Person`.

#### 5. Actor: Client (El Asegurado)
Implementado principalmente como una `RealPerson` que actúa como "Tomador" de la póliza.

#### 6. Actor: Agent (El Vendedor)
Representa al productor de seguros.
*   **Entity: Agent** (`agents`)
    *   Campos: `agentCode`, `licenseNumber`, `isActive`.
    *   Relación: OneToOne con `RealPerson` (permite acceso directo a nombre y apellido).
    *   Relación: OneToMany con `Policy` (historial de ventas - *implementado*).

---

### C. Módulo Core (La Póliza)

Es la entidad central que consolida la información comercial, financiera y de cobertura.

#### 7. Entity: Policy (`policies`)
*   **Identificación:** `policyNumber` (Único), `status` (PENDING, ACTIVE, etc.), `businessType` (NEW, RENEWAL).
*   **Relaciones:**
    *   `client` (ManyToOne -> Person)
    *   `agent` (ManyToOne -> Agent)
    *   `plan` (ManyToOne -> Plan)
*   **Vigencia:** `issueDate`, `startDate`, `endDate`, `renewalDate`.
*   **Financiero:** `insuredAmount`, `premiumAmount`, `currency`, `paymentFrequency`, `paymentMethod`, `installments`.
*   **Overrides:** `deductibleOne`, `deductibleTwo` (Personalización por póliza).

#### 8. Sub-Entidad: PolicyDependent (`policy_dependents`)
Representa a los beneficiarios o asegurados adicionales (hijos, cónyuge).
*   **Campos:** `firstName`, `lastName`, `relationType` (SPOUSE, CHILD), `birthDate`.
*   **Relación:** ManyToOne -> Policy (Cascade).

---

## 4. Puntos Fuertes del Diseño

1.  **Modelo Visual Completo:** Cubre todos los campos críticos visibles en interfaces de seguros reales (Primas, Vigencias, Deducibles).
2.  **Abstracción Financiera:** Simplifica la contabilidad manteniendo solo los valores finales (`premiumAmount`) necesarios para la venta, evitando la complejidad de un sistema contable completo.
3.  **Dependientes en Cascada:** Maneja correctamente relaciones complejas editables dentro de un mismo formulario (Padre-Hijo).
4.  **Patrón Persona:** Separa limpiamente la identidad (quién es) del rol (qué hace), permitiendo que una misma persona pueda ser Cliente, Agente o ambos sin duplicar datos.

---

## 5. Hoja de Ruta de Implementación

1.  **Fase 0: Configuración** (NestJS, Docker, TypeORM).
2.  **Fase 1: Catálogos** (Insurer, Product, Plan) - *Completado*.
3.  **Fase 2: Personas** (Architecture Split: Person/Real/Legal/Agent) - *Completado*.
4.  **Fase 3: Core** (Policy & Dependents) - *Completado*.
5.  **Fase 4: Verificación** (Seeders y Scripts de Prueba) - *Completado*.
