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
];

export const PLAN_RELATIONS = [
    'product',
];

export const BRANCH_RELATIONS = [
    'insurer',
];