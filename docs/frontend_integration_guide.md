# Guía de Integración Frontend: API de Personas (Estructura Plana)

Esta guía documenta los endpoints para `Insurer`, `Agent` y `Contact`. 
**Nota Clave:** La API utiliza una estructura de datos **PLANA**. No se deben enviar objetos anidados para `legalPerson` o `realPerson`. Todas las propiedades se envían en el nivel raíz del JSON.

---

## 1. Aseguradoras (Insurer)

**Endpoint:** `POST /insurers`
**DTO:** `CreateInsurerDto`

Se envían los datos de la empresa y contacto mezclados con los datos propios de la aseguradora.

**Payload Ejemplo:**
```json
{
  "code": "INS-001",
  "executive": "Juan Pérez",
  "agencyNumber": "AG-123",
  "logoUrl": "https://example.com/logo.png",
  
  // Datos Legales (LegalPerson - Aplanados)
  "organizationName": "Seguros del Norte S.A.",
  "socialReason": "Seguros del Norte Sociedad Anónima",
  "website": "https://segurosnorte.com",

  // Datos de Contacto (Person)
  "emails": [
    { "account": "contacto@segurosnorte.com", "label": "work" }
  ],
  "phoneNumbers": [
    { "number": "+541112345678", "label": "main" }
  ],
  "addresses": [
    {
      "street": "Av. Corrientes",
      "streetNumber": "1234",
      "cityId": "uuid-del-city"
    }
  ],
  "identifications": [
    { "typeId": "uuid-rut-type", "value": "20-12345678-9" }
  ]
}
```

---

## 2. Agentes (Agent)

**Endpoint:** `POST /agents`
**DTO:** `CreateAgentDto`

Combina campos de Agente y Persona Real (Física).

**Payload Ejemplo:**
```json
{
  "agentCode": "AGT-99",
  "licenseNumber": "LIC-2024-X",
  "isActive": true,

  // Datos Personales (RealPerson - Aplanados)
  "firstName": "Roberto",
  "lastName": "Gómez",
  "middleName": "Carlos",         // Opcional
  "maternalLastName": "Bolaños",  // Opcional
  "birthDate": "1985-05-15",
  "gender": "male",               // "male" | "female" | "other"
  "civilStatus": "married",       // "single" | "married" | ...
  "nationality": "Argentino",

  // Datos de Contacto (Person)
  "emails": [
    { "account": "roberto.gomez@gmail.com", "label": "personal" }
  ],
  "phoneNumbers": [
    { "number": "+5491187654321", "label": "mobile" }
  ]
}
```

---

## 3. Contactos (Contact)

**Endpoint:** `POST /contact`
**DTO:** `CreateContactDto`

Se crea un contacto (RealPerson). Opcionalmente se puede vincular a una Empresa (`legalPersonId`).

**Opción A: Crear Contacto para una Empresa existente**
```json
{
  "legalPersonId": "uuid-de-la-compania-existente",

  // Datos Personales
  "firstName": "María",
  "lastName": "López",
  "emails": [{ "account": "maria@empresa.com", "label": "work" }]
}
```

**Opción B: Crear Contacto suelto**
Simplemente omite `legalPersonId`.

---

## Actualizaciones (`PATCH`)

Para actualizar, envía solo los campos que quieres cambiar. La lógica se mantiene plana.

**Ejemplo: Actualizar Agente**
`PATCH /agents/{id}`
```json
{
  "isActive": false,
  "lastName": "Gómez de la Fuente", // Actualiza RealPerson
  "emails": [                       // Reemplaza la lista de emails completa
     { "account": "nuevo.email@gmail.com", "label": "main" }
  ]
}
```
> **Nota importante sobre listas:** Al actualizar listas como `emails` o `phones`, se **reemplaza** la lista completa. Si quieres agregar uno, debes enviar los existentes + el nuevo.

---

## Tipos de Datos Útiles

### Enum: Gender
- `male`
- `female`
- `other`

### Enum: CivilStatus
- `single`
- `married`
- `divorced`
- `widowed`
- `separated`

---

## 4. Productos (Product)

**Endpoint:** `POST /products`
**DTO:** `CreateProductDto`

Un producto es la "plantilla" base de seguro.

**Payload:**
```json
{
  "name": "Vida Individual Elite",
  "code": "VID-ELITE",
  "branch": "Vida",
  "insuredAmount": 100000,
  "insurerId": "uuid-aseguradora",
  
  // Opcionales (defaults o nulos)
  "specialBenefits": 0,
  "adminExpenses": 0,
  "deductibleOne": 0,
  "deductibleTwo": 0
}
```

---

## 5. Planes (Plan)

**Endpoint:** `POST /plans`
**DTO:** `CreatePlanDto`

Un plan es una variante específica de un producto.

**Payload:**
```json
{
  "name": "Plan Elite Plus",
  "code": "PL-ELITE+",
  "productId": "uuid-producto",
  
  // Opcionales
  "deductibleOne": 100,
  "deductibleTwo": 200
}
```

---

## 6. Pólizas (Policy)

**Endpoint:** `POST /policies`
**DTO:** `CreatePolicyDto`

La emisión de una póliza vincula un Cliente, un Agente y un Plan.

**Payload:**
```json
{
  "policyNumber": "POL-2024-001",
  "status": "ACTIVE",             // Ver Enum PolicyStatus
  "businessType": "NEW",          // Ver Enum BusinessType
  "issueDate": "2024-01-01",
  "startDate": "2024-01-01",
  "endDate": "2025-01-01",
  
  "insuredAmount": 100000,
  "premiumAmount": 1200,
  "currency": "USD",
  
  "paymentFrequency": "ANNUAL",   // Ver Enum PaymentFrequency
  "paymentMethod": "CREDIT_CARD", // Ver Enum PaymentMethod
  "installments": 1,

  // Relaciones
  "clientId": "uuid-person-del-cliente",
  "agentId": "uuid-agente",
  "planId": "uuid-plan",

  // Dependientes (Opcional)
  "dependents": [
    {
       "firstName": "Hijo",
       "lastName": "Perez",
       "relationType": "CHILD",
       "birthDate": "2020-01-01"
    }
  ]
}
```

### Enums de Póliza

#### PolicyStatus
- `QUOTED`
- `PENDING`
- `ACTIVE`
- `CANCELLED`
- `EXPIRED`

#### BusinessType
- `NEW`
- `RENEWAL`
- `ENDORSEMENT`

#### PaymentFrequency
- `MONTHLY`
- `ANNUAL`
- `SEMI_ANNUAL`

#### PaymentMethod
- `CREDIT_CARD`
- `CASH`
- `TRANSFER`
