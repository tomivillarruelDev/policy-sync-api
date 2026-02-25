export const PERSON_ADDRESS_RELATIONS = [
    'person.addresses',
    'person.addresses.city',
    'person.addresses.city.state',
    'person.addresses.city.state.country',
];

export const LEGAL_PERSON_RELATIONS = [
    'person',
    ...PERSON_ADDRESS_RELATIONS,
    'person.emails',
    'person.phoneNumbers',
    'person.identifications',
    'person.identifications.type',
];

export const REAL_PERSON_RELATIONS = [
    'person',
    ...PERSON_ADDRESS_RELATIONS,
    'person.emails',
    'person.phoneNumbers',
    'person.identifications',
    'gender',
    'civilStatus',
    'nationality',
];

export const INSURER_RELATIONS = [
    ...LEGAL_PERSON_RELATIONS.map((rel) => `legalPerson.${rel}`),
    'products',
];

export const AGENT_RELATIONS = [
    ...REAL_PERSON_RELATIONS.map((rel) => `realPerson.${rel}`),
];

export const PRODUCT_RELATIONS = [
    'insurer',
    'plans',
    'branch',
];

export const PLAN_RELATIONS = [
    'product',
    'product.branch',
];

export const BRANCH_RELATIONS = [
    'insurer',
];

export const CLIENT_RELATIONS = [
    ...REAL_PERSON_RELATIONS.map((rel) => `realPerson.${rel}`),
];

export const POLICY_RELATIONS = [
    // --- Main catalogs ---
    'policyStatus',
    'policyCategory',

    // --- Actors ---
    'client',
    ...CLIENT_RELATIONS.map((rel) => `client.${rel}`),

    'agent',
    ...AGENT_RELATIONS.map((rel) => `agent.${rel}`),

    'insurer',
    'insurer.legalPerson',

    'plan',

    // --- Previous Policy ---
    'previousPolicy',

    // --- Child entities ---
    'insuredVehicles',
    'insuredVehicles.usageType',
    'insuredVehicles.vehicleType',
    'insuredVehicles.country',

    'insuredProperties',
    'insuredProperties.city',
    'insuredProperties.city.state',
    'insuredProperties.city.state.country',
    'insuredProperties.propertyType',
    'insuredProperties.roofMaterial',

    'dependents',
    'dependents.realPerson',
    'dependents.realPerson.person',
    'dependents.relationType',

    'beneficiaries',
    'beneficiaries.realPerson',
    'beneficiaries.realPerson.person',
    'beneficiaries.relationType',

    'additionalCoverages',

    'installments',
];