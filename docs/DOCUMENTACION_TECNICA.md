Guía de Integración Frontend: API de Personas (Versión 2.0 - Arquitectura BaseService)
Esta guía documenta los contratos de API actualizados tras la refactorización BaseService. Regla de Oro: La API es 100% PLANA (Flat). Tanto en la Entrada (POST/PATCH) como en la Salida (GET), no existen objetos anidados como realPerson o legalPerson.

1. Patrones Generales (BaseService)
Gracias a la nueva arquitectura, todos los módulos principales (Insurers, Agents, Contacts) comparten este comportamiento:

GET /list: Devuelve un array de objetos planos DTO.

GET /:id: Devuelve un objeto plano DTO.

DELETE /:id: Ejecuta un Soft Delete.

Respuesta Éxito: 200 OK (Body vacío).

Error: 404 Not Found (Si el ID no existe o ya fue borrado).

2. Agentes (Agent)
El módulo de vendedores. Combina datos de licencia profesional con datos personales.

A. Lectura (GET /agents)
Importante para la Tabla: Los datos vienen aplanados. No busques row.realPerson.firstName.

Respuesta JSON:

JSON

[
  {
    "id": "uuid-del-agente",
    "agentCode": "AGT-99",
    "licenseNumber": "LIC-2024-X",
    "isActive": true,
    // Datos personales aplanados (vienen directo en la raíz)
    "firstName": "Roberto",
    "lastName": "Gómez",
    "email": "roberto@gmail.com" 
  }
]
B. Creación (POST /agents)
DTO: CreateAgentDto

JSON

{
  "agentCode": "AGT-99",
  "licenseNumber": "LIC-2024-X",
  "isActive": true,

  // Datos Personales (Directos en raíz)
  "firstName": "Roberto",
  "lastName": "Gómez",
  "birthDate": "1985-05-15",
  "gender": "male",
  "nationality": "Argentino",

  // Listas de contacto (Estas sí son arrays, pero simples)
  "emails": [ { "account": "roberto@gmail.com", "label": "work" } ],
  "phoneNumbers": [ { "number": "+54911...", "label": "mobile" } ]
}
3. Aseguradoras (Insurer)
El módulo de compañías de seguros.

A. Lectura (GET /insurers)
Respuesta JSON:

JSON

[
  {
    "id": "uuid-aseguradora",
    "code": "INS-001",
    "executive": "Juan Pérez",
    "logoUrl": "...",
    // Datos legales aplanados
    "organizationName": "Seguros del Norte S.A.",
    "socialReason": "Seguros del Norte Sociedad Anónima",
    "cuit": "30-12345678-9"
  }
]
B. Creación (POST /insurers)
DTO: CreateInsurerDto

JSON

{
  "code": "INS-001",
  "executive": "Juan Pérez",
  "logoUrl": "https://...",
  
  // Datos Legales mezclados
  "organizationName": "Seguros del Norte S.A.",
  "socialReason": "Seguros del Norte Sociedad Anónima",
  
  // Contacto
  "emails": [ { "account": "contacto@norte.com", "label": "main" } ],
  "addresses": [ { "street": "Av. Corrientes", "streetNumber": "100" } ]
}
4. Contactos (Contact)
A. Creación (POST /contacts)
Se usa para crear personas sueltas o vincularlas a una empresa existente.

Opción A: Contacto para Empresa

JSON

{
  "legalPersonId": "uuid-de-la-compania", 
  "firstName": "María",
  "lastName": "López",
  "emails": [{ "account": "maria@empresa.com", "label": "work" }]
}
5. Actualizaciones (PATCH /:resource/:id)
La lógica de actualización parcial también espera una estructura plana. Nota: Al actualizar arrays (emails, addresses), se reemplaza la lista completa.

Ejemplo Patch Agente:

JSON

{
  "isActive": false,
  "lastName": "Gómez de la Fuente" // Actualiza la persona real subyacente
}
6. Referencia de Enums
Gender
male, female, other

CivilStatus
single, married, divorced, widowed

PolicyStatus
QUOTED, PENDING, ACTIVE, CANCELLED, EXPIRED