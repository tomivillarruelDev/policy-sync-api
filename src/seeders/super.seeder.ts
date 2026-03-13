import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';

import { InsurerService } from '../modules/insurer/insurer.service';
import { ProductService } from '../modules/product/product.service';
import { PlanService } from '../modules/plan/plan.service';
import { RealPersonService } from '../modules/person/services/real-person.service';
import { AgentService } from '../modules/agent/agent.service';
import { PolicyService } from '../modules/policy/policy.service';
import { BusinessType } from '../modules/policy/enums/business-type.enum';
import { CivilStatus } from '../modules/person/entities/civil-status.entity';
import { CreateClientDto } from '../modules/clients/dto/create-client.dto';
import { ClientsService } from '../modules/clients/clients.service';
import { CreateInsurerDto } from '../modules/insurer/dto/create-insurer.dto';
import { CreateAgentDto } from '../modules/agent/dto/create-agent.dto';
import { IdentificationType } from '../modules/person/common/identification/entity/identification-type.entity';
import { Gender } from '../modules/person/entities/gender.entity';
import { City } from '../modules/person/common/address/entities/city.entity';
import { BranchService } from '../modules/branch/branch.service';
import { Nationality } from '../modules/person/entities/nationality.entity';
import { RelationType } from '../modules/policy/catalogs/relation-type/relation-type.entity';
import { PropertyType } from '../modules/policy/catalogs/property-type/property-type.entity';
import { RoofMaterial } from '../modules/policy/catalogs/roof-material/roof-material.entity';

import { IdentificationSeeder } from './identification.seeder';
import { GenderSeeder } from './gender.seeder';
import { CivilStatusSeeder } from './civil-status.seeder';
import { NationalitySeeder } from './nationality.seeder';

@Injectable()
export class SuperSeeder {
    private readonly logger = new Logger(SuperSeeder.name);

    constructor(
        private readonly insurerService: InsurerService,
        private readonly branchService: BranchService,
        private readonly productService: ProductService,
        private readonly planService: PlanService,
        private readonly realPersonService: RealPersonService,
        private readonly clientsService: ClientsService,
        private readonly agentService: AgentService,
        private readonly policyService: PolicyService,
        private readonly dataSource: DataSource,
        @InjectRepository(IdentificationType)
        private readonly identificationTypeRepo: Repository<IdentificationType>,
        @InjectRepository(City)
        private readonly cityRepo: Repository<City>,
        @InjectRepository(Gender)
        private readonly genderRepo: Repository<Gender>,
        @InjectRepository(CivilStatus)
        private readonly civilStatusRepo: Repository<CivilStatus>,
        private readonly identificationSeeder: IdentificationSeeder,
        private readonly genderSeeder: GenderSeeder,
        private readonly civilStatusSeeder: CivilStatusSeeder,
        @InjectRepository(Nationality)
        private readonly nationalityRepo: Repository<Nationality>,
        private readonly nationalitySeeder: NationalitySeeder,
        @InjectRepository(RelationType)
        private readonly relationTypeRepo: Repository<RelationType>,
        @InjectRepository(PropertyType)
        private readonly propertyTypeRepo: Repository<PropertyType>,
        @InjectRepository(RoofMaterial)
        private readonly roofMaterialRepo: Repository<RoofMaterial>,
    ) { }

    async seed() {
        this.logger.log('═══════════════════════════════════════════════════');
        this.logger.log('  INICIANDO SUPER SEEDER (DATOS MASIVOS CON FAKER)');
        this.logger.log('═══════════════════════════════════════════════════');

        // --- Seeders satélite ---
        await this.identificationSeeder.seed();
        await this.genderSeeder.seed();
        await this.civilStatusSeeder.seed();
        await this.nationalitySeeder.seed();

        // --- Datos base ---
        const genders = await this.genderRepo.find();
        const civilStatuses = await this.civilStatusRepo.find();
        const nationalities = await this.nationalityRepo.find();
        const identTypes = await this.identificationTypeRepo.find();
        const dniType = identTypes.find(t => t.name === 'DNI') || identTypes[0];
        const rucType = identTypes.find(t => t.name === 'RUC') || dniType;

        // Catálogos de póliza
        const relationTypes = await this.relationTypeRepo.find();
        const propertyTypes = await this.propertyTypeRepo.find();
        const roofMaterials = await this.roofMaterialRepo.find();

        // Configuración general
        const NUM_INSURERS = 5;
        const BRANCHES_PER_INSURER = 3;
        const PRODUCTS_PER_BRANCH = 2;
        const PLANS_PER_PRODUCT = 2;
        const NUM_AGENTS = 15;
        const NUM_CLIENTS = 50;
        const NUM_POLICIES = 100;

        // --- Ubicación ---
        this.logger.log('🌍 Buscando Ciudades...');
        const city = await this.cityRepo.findOne({
            where: {},
            relations: ['state', 'state.country'],
        });

        if (!city) {
            throw new Error('No se encontraron ciudades. Ejecuta "npm run seed:location" primero.');
        }
        const cityId = city.id;
        const countryId = city.state?.country?.id;

        // 1. ASEGURADORAS
        this.logger.log(`🏢 [1/7] Creando ${NUM_INSURERS} Aseguradoras...`);
        const insurers: any[] = [];
        for (let i = 0; i < NUM_INSURERS; i++) {
            const insurer = await this.insurerService.create({
                code: `INS-${faker.string.uuid().substring(0, 8).toUpperCase()}`,
                executive: faker.person.fullName(),
                organizationName: faker.company.name() + ' Seguros ' + faker.string.numeric(3),
                socialReason: faker.company.name() + ' S.A. ' + faker.string.numeric(3),
                emails: [{ account: `insurer-${faker.string.uuid()}@test.com` }],
                addresses: [{ street: faker.location.street(), streetNumber: faker.location.buildingNumber(), cityId }],
                phoneNumbers: [{ number: faker.phone.number({ style: 'national' }) }],
                identifications: rucType ? [{ typeId: rucType.id, value: `RUC-${faker.string.uuid().substring(0, 8)}` }] : [],
            } as CreateInsurerDto);
            insurers.push(insurer);
        }

        // 2. RAMOS (BRANCHES)
        this.logger.log(`🏷️  [2/7] Creando ${NUM_INSURERS * BRANCHES_PER_INSURER} Ramos...`);
        const branches: any[] = [];
        const branchNames = ['Vehículos', 'Hogar', 'Vida', 'Salud', 'Mascotas', 'Viajes', 'Empresarial'];
        for (const insurer of insurers) {
            for (let j = 0; j < BRANCHES_PER_INSURER; j++) {
                const baseName = faker.helpers.arrayElement(branchNames);
                const branchName = baseName + ' ' + faker.word.adjective({ length: { min: 4, max: 7 } });
                
                let assignedRiskType = 'other';
                if (baseName === 'Vehículos') assignedRiskType = 'vehicle';
                else if (baseName === 'Hogar' || baseName === 'Empresarial') assignedRiskType = 'property';
                else if (baseName === 'Salud') assignedRiskType = 'medical';
                else if (baseName === 'Vida') assignedRiskType = 'life';

                const branch = await this.branchService.create({
                    name: branchName + ' ' + faker.string.numeric(4),
                    code: `BR-${faker.string.uuid().substring(0, 8).toUpperCase()}`,
                    insurerId: insurer.id,
                    riskType: assignedRiskType as any,
                });
                branches.push({ ...branch, insurerId: insurer.id }); // Retain manual insurerId
            }
        }

        // 3. PRODUCTOS
        this.logger.log(`📦 [3/7] Creando ${branches.length * PRODUCTS_PER_BRANCH} Productos...`);
        const products: any[] = [];
        for (const branch of branches) {
            for (let k = 0; k < PRODUCTS_PER_BRANCH; k++) {
                const product = await this.productService.create({
                    name: `${branch.name} ${faker.word.adjective()} PRO`,
                    code: `PRD-${faker.string.uuid().substring(0, 8).toUpperCase()}`,
                    branchId: branch.id,
                    insuredAmount: faker.number.int({ min: 10000, max: 500000 }),
                    insurerId: branch.insurerId,
                });
                products.push(product);
            }
        }

        // 4. PLANES
        this.logger.log(`📋 [4/7] Creando ${products.length * PLANS_PER_PRODUCT} Planes...`);
        const plans: any[] = [];
        for (const product of products) {
            for (let l = 0; l < PLANS_PER_PRODUCT; l++) {
                const plan = await this.planService.create({
                    name: `Plan ${faker.word.noun()} ${l === 0 ? 'Básico' : 'Premium'}`,
                    code: `PLN-${faker.string.uuid().substring(0, 8).toUpperCase()}`,
                    deductibleOne: faker.number.int({ min: 0, max: 1000 }),
                    productId: product.id,
                });
                plans.push({ ...plan, product }); // Keep product reference for policy generation
            }
        }

        // 5. AGENTES
        this.logger.log(`🧑‍💼 [5/7] Creando ${NUM_AGENTS} Agentes...`);
        const agents: any[] = [];
        for (let m = 0; m < NUM_AGENTS; m++) {
            const agent = await this.agentService.create({
                agentCode: `AGT-${faker.string.uuid().substring(0, 8).toUpperCase()}`,
                licenseNumber: `LIC-${faker.string.uuid().substring(0, 8).toUpperCase()}`,
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                emails: [{ account: `agent-${faker.string.uuid()}@test.com` }],
                addresses: [{ street: faker.location.street(), streetNumber: faker.location.buildingNumber(), cityId }],
                phoneNumbers: [{ number: faker.phone.number({ style: 'national' }) }],
                birthDate: faker.date.birthdate({ min: 25, max: 60, mode: 'age' }),
                genderId: faker.helpers.arrayElement(genders)?.id,
                identifications: dniType ? [{ typeId: dniType.id, value: `DNI-${faker.string.uuid().substring(0, 8)}` }] : [],
            } as CreateAgentDto);
            agents.push(agent);
        }

        // 6. CLIENTES
        this.logger.log(`👥 [6/7] Creando ${NUM_CLIENTS} Clientes...`);
        const clients: any[] = [];
        for (let n = 0; n < NUM_CLIENTS; n++) {
            const client = await this.clientsService.create({
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                emails: [{ account: `client-${faker.string.uuid()}@test.com` }],
                addresses: [{ street: faker.location.street(), streetNumber: faker.location.buildingNumber(), cityId }],
                phoneNumbers: [{ number: faker.phone.number({ style: 'national' }) }],
                birthDate: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
                genderId: faker.helpers.arrayElement(genders)?.id,
                civilStatusId: faker.helpers.arrayElement(civilStatuses)?.id,
                nationalityId: faker.helpers.arrayElement(nationalities)?.id,
                identifications: dniType ? [{ typeId: dniType.id, value: `DNI-${faker.string.uuid().substring(0, 8)}` }] : [],
                isActive: true,
            } as CreateClientDto);
            clients.push(client);
        }

        // 7. PÓLIZAS
        this.logger.log(`📜 [7/7] Creando ${NUM_POLICIES} Pólizas...`);
        const activeStatus = await this.dataSource.getRepository('PolicyStatus').findOne({ where: { slug: 'ACTIVE' } });
        const individualCategory = await this.dataSource.getRepository('PolicyCategory').findOne({ where: { slug: 'INDIVIDUAL' } });

        if (!activeStatus || !individualCategory) {
            this.logger.warn('⚠️ Faltan catálogos de Póliza (Status/Category). No se pueden crear pólizas.');
            return;
        }

        let createdPolicies = 0;
        for (let p = 0; p < NUM_POLICIES; p++) {
            const client = faker.helpers.arrayElement(clients);
            const agent = faker.helpers.arrayElement(agents);
            const planObj = faker.helpers.arrayElement(plans);

            const now = new Date();
            const nextYear = new Date(now);
            nextYear.setFullYear(nextYear.getFullYear() + 1);

            const netPremium = faker.number.int({ min: 500, max: 5000 });
            const taxAmount = netPremium * 0.21;
            const totalPremium = netPremium + taxAmount;

            const paymentFrequencies = ['MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL'];

            try {
                await this.policyService.create({
                    policyNumber: `POL-S-${faker.string.uuid().substring(0, 8).toUpperCase()}`,
                    businessType: BusinessType.NEW_BUSINESS,
                    policyStatusId: activeStatus.id,
                    policyCategoryId: individualCategory.id,
                    clientId: client.id,
                    agentId: agent.id,
                    insurerId: planObj.product.insurerId,
                    planId: planObj.id,
                    issuedDate: now.toISOString(),
                    validityStart: now.toISOString(),
                    validityEnd: nextYear.toISOString(),
                    renewalDate: nextYear.toISOString(),
                    currency: faker.helpers.arrayElement(['USD', 'ARS']),
                    sumInsured: faker.number.int({ min: 10000, max: 1000000 }),
                    netPremium: netPremium,
                    taxAmount: taxAmount,
                    totalPremium: totalPremium,
                    commissionPercentage: faker.number.int({ min: 5, max: 20 }),
                    paymentFrequency: faker.helpers.arrayElement(paymentFrequencies),
                    paymentMethod: faker.helpers.arrayElement(['CREDIT_CARD', 'BANK_TRANSFER', 'CASH']),
                    numberOfInstallments: faker.number.int({ min: 1, max: 12 }),
                    vehicles: faker.datatype.boolean() ? [{
                        brand: faker.vehicle.manufacturer(),
                        model: faker.vehicle.model(),
                        vehicleVersion: 'Standard',
                        year: faker.number.int({ min: 2010, max: 2024 }),
                        plate: faker.vehicle.vrm(),
                        chassis: faker.vehicle.vin(),
                        engine: faker.string.alphanumeric(10).toUpperCase(),
                        insuredValue: faker.number.int({ min: 5000, max: 50000 }),
                        countryId: countryId,
                        address: faker.location.city(),
                    }] : undefined,
                    properties: (!faker.datatype.boolean() && propertyTypes.length > 0) ? [{
                        cityId: cityId,
                        street: faker.location.street(),
                        streetNumber: faker.location.buildingNumber(),
                        hasAlarm: faker.datatype.boolean(),
                        hasReinforcedDoor: faker.datatype.boolean(),
                        buildingFireSum: faker.number.int({ min: 100000, max: 500000 }),
                        contentFireSum: faker.number.int({ min: 10000, max: 50000 }),
                        propertyTypeId: faker.helpers.arrayElement(propertyTypes).id,
                        roofMaterialId: faker.helpers.arrayElement(roofMaterials)?.id,
                        totalSquareMeters: faker.number.int({ min: 50, max: 500 }),
                        builtSquareMeters: faker.number.int({ min: 40, max: 400 }),
                    }] : undefined,
                    installments: [
                        { installmentNumber: 1, dueDate: now.toISOString(), amount: totalPremium / 12, status: 'PAID' },
                    ],
                });
                createdPolicies++;
            } catch (err) {
                this.logger.error(`Error creando poliza ${p}: `, err.message);
            }
        }

        this.logger.log(`>> Se crearon ${createdPolicies} pólizas exitosamente.`);

        this.logger.log('═══════════════════════════════════════════════════');
        this.logger.log('  ✅ SUPER SEEDER COMPLETADO CON ÉXITO');
        this.logger.log('═══════════════════════════════════════════════════');
    }
}
