import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
import { IdentificationSeeder } from './identification.seeder';
import { IdentificationType } from '../modules/person/common/identification/entity/identification-type.entity';
import { Gender } from '../modules/person/entities/gender.entity';
import { GenderSeeder } from './gender.seeder';
import { CivilStatusSeeder } from './civil-status.seeder';
import { City } from '../modules/person/common/address/entities/city.entity';
import { BranchService } from '../modules/branch/branch.service';
import { Nationality } from '../modules/person/entities/nationality.entity';
import { NationalitySeeder } from './nationality.seeder';
import { RelationType } from '../modules/policy/catalogs/relation-type/relation-type.entity';
import { PropertyType } from '../modules/policy/catalogs/property-type/property-type.entity';
import { RoofMaterial } from '../modules/policy/catalogs/roof-material/roof-material.entity';

// Identificadores de pólizas de prueba (facilita la limpieza)
const TEST_POLICY_NUMBERS = [
  'POL-VEH-001',
  'POL-HOG-001',
  'POL-MED-001',
  'POL-VID-001',
];

const TEST_INSURER_CODES = ['GLOB-MVP', 'MAPFRE-TEST'];
const TEST_AGENT_CODES = ['AG-007', 'AG-008'];
const TEST_CLIENT_EMAILS = [
  'juan.perez@test.com',
  'maria.gonzalez@test.com',
  'carlos.lopez@test.com',
  'ana.martinez@test.com',
];

@Injectable()
export class CatalogVerificationSeeder {
  private readonly logger = new Logger(CatalogVerificationSeeder.name);

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
    this.logger.log('  INICIANDO VERIFICACIÓN COMPLETA (5 Ramos)');
    this.logger.log('═══════════════════════════════════════════════════');

    await this.clearExistingData();

    // --- Seeders satélite ---
    await this.identificationSeeder.seed();
    await this.genderSeeder.seed();
    await this.civilStatusSeeder.seed();
    await this.nationalitySeeder.seed();

    // --- Datos base ---
    const maleGender = await this.genderRepo.findOne({ where: { slug: 'male' } });
    const femaleGender = await this.genderRepo.findOne({ where: { slug: 'female' } });
    const singleStatus = await this.civilStatusRepo.findOne({ where: { slug: 'single' } });
    const marriedStatus = await this.civilStatusRepo.findOne({ where: { slug: 'married' } });
    const argentinaNationality = await this.nationalityRepo.findOne({ where: { name: 'Argentine' } });

    const dniType = await this.identificationTypeRepo.findOne({ where: { name: 'DNI' } });
    const rucType = await this.identificationTypeRepo.findOne({ where: { name: 'RUC' } });
    const dniTypeId = dniType?.id;
    const rucTypeId = rucType?.id || dniTypeId;

    // Catálogos de póliza
    const spouseRelation = await this.relationTypeRepo.findOne({ where: { slug: 'SPOUSE' } });
    const childRelation = await this.relationTypeRepo.findOne({ where: { slug: 'CHILD' } });
    const houseType = await this.propertyTypeRepo.findOne({ where: { slug: 'HOUSE' } });
    const concreteRoof = await this.roofMaterialRepo.findOne({ where: { slug: 'CONCRETE' } });

    // --- Ubicación ---
    this.logger.log('🌍 Buscando Ciudad: Argentina > Córdoba > Córdoba...');
    const cityId = await this.findCityId();

    const city = await this.cityRepo.findOne({
      where: { id: cityId },
      relations: ['state', 'state.country'],
    });
    const countryId = city?.state?.country?.id;
    this.logger.log(`>> Ubicación: ${city?.name} > ${city?.state?.nameEs} > ${city?.state?.country?.nameEs}`);

    // ═══════════════════════════════════════════
    // 1. ASEGURADORAS
    // ═══════════════════════════════════════════
    this.logger.log('🏢 [1/8] Creando Aseguradoras...');

    const insurer1 = await this.insurerService.create({
      code: 'GLOB-MVP',
      executive: 'Juan Ejecutivo',
      organizationName: 'Aseguradora Global MVP',
      socialReason: 'Global MVP S.A.',
      emails: [{ account: 'global@mvp.com' }],
      addresses: [{ street: 'Centro Financiero', streetNumber: '100', cityId }],
      phoneNumbers: [{ number: '+5493511234567' }],
      identifications: rucTypeId ? [{ typeId: rucTypeId, value: '20987654321' }] : [],
    } as CreateInsurerDto);
    this.logger.log(`>> Aseguradora 1: ${insurer1.organizationName} (ID: ${insurer1.id})`);

    const insurer2 = await this.insurerService.create({
      code: 'MAPFRE-TEST',
      executive: 'Laura Directora',
      organizationName: 'MAPFRE Argentina',
      socialReason: 'MAPFRE Argentina Seguros S.A.',
      emails: [{ account: 'contacto@mapfre-test.com' }],
      addresses: [{ street: 'Av. Corrientes', streetNumber: '800', cityId }],
      phoneNumbers: [{ number: '+5491144556677' }],
      identifications: rucTypeId ? [{ typeId: rucTypeId, value: '30712345679' }] : [],
    } as CreateInsurerDto);
    this.logger.log(`>> Aseguradora 2: ${insurer2.organizationName} (ID: ${insurer2.id})`);

    // ═══════════════════════════════════════════
    // 2. RAMOS (4 Ramos)
    // ═══════════════════════════════════════════
    this.logger.log('🏷️  [2/8] Creando Ramos (Branches)...');

    const branchVehicle = await this.branchService.create({
      name: 'Vehículos',
      code: 'RAMO-VEH',
      insurerId: insurer1.id,
      riskType: 'vehicle' as any,
    });

    const branchProperty = await this.branchService.create({
      name: 'Ramo Hogar',
      code: 'RAMO-HOG',
      insurerId: insurer1.id,
      riskType: 'property' as any,
    });

    const branchMedical = await this.branchService.create({
      name: 'Asistencia Médica',
      code: 'RAMO-MED',
      insurerId: insurer2.id,
      riskType: 'medical' as any,
    });

    const branchLife = await this.branchService.create({
      name: 'Vida Individual',
      code: 'RAMO-VID',
      insurerId: insurer2.id,
      riskType: 'life' as any,
    });

    this.logger.log(`>> Ramos: Vehículos, Hogar, Asistencia Médica, Vida Individual`);

    // ═══════════════════════════════════════════
    // 3. PRODUCTOS (1 por ramo)
    // ═══════════════════════════════════════════
    this.logger.log('📦 [3/8] Creando Productos...');

    const productVeh = await this.productService.create({
      name: 'Auto Todo Riesgo',
      code: 'PROD-VEH',
      branchId: branchVehicle.id,
      insuredAmount: 50000,
      insurerId: insurer1.id,
    });

    const productProp = await this.productService.create({
      name: 'Hogar Integral',
      code: 'PROD-HOG',
      branchId: branchProperty.id,
      insuredAmount: 200000,
      insurerId: insurer1.id,
    });

    const productMed = await this.productService.create({
      name: 'Asistencia Médica Premium',
      code: 'PROD-MED',
      branchId: branchMedical.id,
      insuredAmount: 100000,
      insurerId: insurer2.id,
    });

    const productLife = await this.productService.create({
      name: 'Vida Individual Elite',
      code: 'PROD-VID',
      branchId: branchLife.id,
      insuredAmount: 500000,
      insurerId: insurer2.id,
    });

    // ═══════════════════════════════════════════
    // 4. PLANES (1 por producto)
    // ═══════════════════════════════════════════
    this.logger.log('📋 [4/8] Creando Planes...');

    const planVeh = await this.planService.create({
      name: 'Plan Auto Premium',
      code: 'PL-VEH-PREM',
      deductibleOne: 500,
      productId: productVeh.id,
    });

    const planProp = await this.planService.create({
      name: 'Plan Hogar Total',
      code: 'PL-HOG-TOT',
      deductibleOne: 200,
      productId: productProp.id,
    });

    const planMed = await this.planService.create({
      name: 'Plan Médica Familiar',
      code: 'PL-MED-FAM',
      deductibleOne: 100,
      productId: productMed.id,
    });

    const planLife = await this.planService.create({
      name: 'Plan Vida Plus',
      code: 'PL-VID-PLUS',
      deductibleOne: 0,
      productId: productLife.id,
    });

    // ═══════════════════════════════════════════
    // 5. CLIENTES (4 personas)
    // ═══════════════════════════════════════════
    this.logger.log('👥 [5/8] Creando Clientes...');

    const clientJuan = await this.clientsService.create({
      firstName: 'Juan',
      lastName: 'Perez',
      emails: [{ account: 'juan.perez@test.com' }],
      addresses: [{ street: 'Calle Falsa', streetNumber: '123', cityId }],
      phoneNumbers: [{ number: '351-555-1001' }],
      birthDate: new Date('1990-01-15'),
      genderId: maleGender?.id,
      civilStatusId: marriedStatus?.id,
      nationalityId: argentinaNationality?.id,
      identifications: dniTypeId ? [{ typeId: dniTypeId, value: '30111222' }] : [],
      isActive: true,
    } as CreateClientDto);

    const clientMaria = await this.clientsService.create({
      firstName: 'María',
      lastName: 'González',
      emails: [{ account: 'maria.gonzalez@test.com' }],
      addresses: [{ street: 'Av. Colón', streetNumber: '456', cityId }],
      phoneNumbers: [{ number: '351-555-1002' }],
      birthDate: new Date('1985-06-20'),
      genderId: femaleGender?.id,
      civilStatusId: singleStatus?.id,
      nationalityId: argentinaNationality?.id,
      identifications: dniTypeId ? [{ typeId: dniTypeId, value: '28333444' }] : [],
      isActive: true,
    } as CreateClientDto);

    const clientCarlos = await this.clientsService.create({
      firstName: 'Carlos',
      lastName: 'López',
      emails: [{ account: 'carlos.lopez@test.com' }],
      addresses: [{ street: 'Bv. San Juan', streetNumber: '789', cityId }],
      phoneNumbers: [{ number: '351-555-1003' }],
      birthDate: new Date('1978-11-03'),
      genderId: maleGender?.id,
      civilStatusId: marriedStatus?.id,
      nationalityId: argentinaNationality?.id,
      identifications: dniTypeId ? [{ typeId: dniTypeId, value: '22555666' }] : [],
      isActive: true,
    } as CreateClientDto);

    const clientAna = await this.clientsService.create({
      firstName: 'Ana',
      lastName: 'Martínez',
      emails: [{ account: 'ana.martinez@test.com' }],
      addresses: [{ street: 'Caseros', streetNumber: '321', cityId }],
      phoneNumbers: [{ number: '351-555-1004' }],
      birthDate: new Date('1995-03-12'),
      genderId: femaleGender?.id,
      civilStatusId: singleStatus?.id,
      nationalityId: argentinaNationality?.id,
      identifications: dniTypeId ? [{ typeId: dniTypeId, value: '35777888' }] : [],
      isActive: true,
    } as CreateClientDto);

    this.logger.log(`>> Clientes: Juan Perez, María González, Carlos López, Ana Martínez`);

    // Obtener RealPerson IDs para usar en dependents/beneficiaries
    const clientMariaFull = await this.clientsService.findOne(clientMaria.id);
    const clientAnaFull = await this.clientsService.findOne(clientAna.id);
    const mariaRealPersonId = (clientMariaFull as any).realPersonId || clientMariaFull.id;
    const anaRealPersonId = (clientAnaFull as any).realPersonId || clientAnaFull.id;

    // ═══════════════════════════════════════════
    // 6. AGENTES (2)
    // ═══════════════════════════════════════════
    this.logger.log('🧑‍💼 [6/8] Creando Agentes...');

    const agent1 = await this.agentService.create({
      agentCode: 'AG-007',
      licenseNumber: 'LIC-007',
      firstName: 'Roberto',
      lastName: 'Smith',
      emails: [{ account: 'agent.smith@matrix.com' }],
      addresses: [{ street: 'Av. Vélez Sársfield', streetNumber: '500', cityId }],
      phoneNumbers: [{ number: '351-555-9001' }],
      birthDate: new Date('1982-05-05'),
      genderId: maleGender?.id,
      identifications: dniTypeId ? [{ typeId: dniTypeId, value: '25999888' }] : [],
    } as CreateAgentDto);

    const agent2 = await this.agentService.create({
      agentCode: 'AG-008',
      licenseNumber: 'LIC-008',
      firstName: 'Lucía',
      lastName: 'Fernández',
      emails: [{ account: 'lucia.fernandez@agency.com' }],
      addresses: [{ street: 'Duarte Quirós', streetNumber: '200', cityId }],
      phoneNumbers: [{ number: '351-555-9002' }],
      birthDate: new Date('1990-09-15'),
      genderId: femaleGender?.id,
      identifications: dniTypeId ? [{ typeId: dniTypeId, value: '33111222' }] : [],
    } as CreateAgentDto);

    this.logger.log(`>> Agentes: Roberto Smith (AG-007), Lucía Fernández (AG-008)`);

    // ═══════════════════════════════════════════
    // 7. PÓLIZAS CON RIESGOS (4 pólizas, una por ramo)
    // ═══════════════════════════════════════════
    const activeStatus = await this.dataSource.getRepository('PolicyStatus').findOne({ where: { slug: 'ACTIVE' } });
    const individualCategory = await this.dataSource.getRepository('PolicyCategory').findOne({ where: { slug: 'INDIVIDUAL' } });

    if (!activeStatus || !individualCategory) {
      this.logger.warn('⚠️ Faltan catálogos de Póliza (Status/Category). Saltando creación de pólizas.');
      return;
    }

    const now = new Date();
    const nextYear = new Date(now);
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    // ──────────────────────────────────────────
    // 7a. PÓLIZA VEHÍCULOS
    // ──────────────────────────────────────────
    this.logger.log('🚗 [7a/8] Póliza de Vehículos...');
    const policyVeh = await this.policyService.create({
      policyNumber: 'POL-VEH-001',
      businessType: BusinessType.NEW_BUSINESS,
      policyStatusId: activeStatus.id,
      policyCategoryId: individualCategory.id,
      clientId: clientJuan.id,
      agentId: agent1.id,
      insurerId: insurer1.id,
      planId: planVeh.id,
      issuedDate: now.toISOString(),
      validityStart: now.toISOString(),
      validityEnd: nextYear.toISOString(),
      renewalDate: nextYear.toISOString(),
      currency: 'USD',
      sumInsured: 35000,
      netPremium: 1200,
      taxAmount: 252,
      totalPremium: 1452,
      commissionPercentage: 12,
      paymentFrequency: 'MONTHLY',
      paymentMethod: 'CREDIT_CARD',
      numberOfInstallments: 12,
      vehicles: [{
        brand: 'Toyota',
        model: 'Corolla',
        vehicleVersion: 'XEI 2.0',
        year: 2024,
        plate: 'AB-123-CD',
        chassis: '9BWZZZ377VT004251',
        engine: '1NZ-FE-2024',
        insuredValue: 35000,
        countryId: countryId,
        address: 'Córdoba Capital',
      }],
      additionalCoverages: [
        { coverageName: 'Granizo', insuredValue: 5000 },
        { coverageName: 'Cristales', insuredValue: 2000, percentage: 100 },
      ],
      installments: [
        { installmentNumber: 1, dueDate: now.toISOString(), amount: 121, status: 'PAID' },
        { installmentNumber: 2, dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(), amount: 121, status: 'PENDING' },
      ],
    });
    this.logger.log(`>> Póliza ${policyVeh.policyNumber} creada con vehículo + 2 coberturas + 2 cuotas`);

    // ──────────────────────────────────────────
    // 7b. PÓLIZA HOGAR
    // ──────────────────────────────────────────
    this.logger.log('🏠 [7b/8] Póliza de Hogar...');
    const policyProp = await this.policyService.create({
      policyNumber: 'POL-HOG-001',
      businessType: BusinessType.NEW_BUSINESS,
      policyStatusId: activeStatus.id,
      policyCategoryId: individualCategory.id,
      clientId: clientMaria.id,
      agentId: agent1.id,
      insurerId: insurer1.id,
      planId: planProp.id,
      issuedDate: now.toISOString(),
      validityStart: now.toISOString(),
      validityEnd: nextYear.toISOString(),
      currency: 'ARS',
      sumInsured: 25000000,
      netPremium: 45000,
      taxAmount: 9450,
      totalPremium: 54450,
      commissionPercentage: 15,
      paymentFrequency: 'ANNUAL',
      paymentMethod: 'BANK_TRANSFER',
      numberOfInstallments: 1,
      properties: [{
        cityId: cityId,
        street: 'Av. Siempre Viva',
        streetNumber: '742',
        hasAlarm: true,
        hasReinforcedDoor: true,
        buildingFireSum: 20000000,
        contentFireSum: 5000000,
        propertyTypeId: houseType?.id,
        roofMaterialId: concreteRoof?.id,
        totalSquareMeters: 250,
        builtSquareMeters: 180,
      }],
      additionalCoverages: [
        { coverageName: 'Robo', insuredValue: 3000000 },
        { coverageName: 'Responsabilidad Civil', insuredValue: 5000000 },
      ],
      installments: [
        { installmentNumber: 1, dueDate: now.toISOString(), amount: 54450, status: 'PENDING' },
      ],
    });
    this.logger.log(`>> Póliza ${policyProp.policyNumber} creada con propiedad + 2 coberturas`);

    // ──────────────────────────────────────────
    // 7c. PÓLIZA ASISTENCIA MÉDICA (con Dependientes)
    // ──────────────────────────────────────────
    this.logger.log('🏥 [7c/8] Póliza de Asistencia Médica...');

    // Necesitamos RealPerson IDs reales para los dependientes
    // Buscamos los RealPerson de los clientes creados
    const clientRepo = this.dataSource.getRepository('Client');
    const mariaClient = await clientRepo.findOne({
      where: { id: clientMaria.id },
      relations: ['realPerson'],
    });
    const anaClient = await clientRepo.findOne({
      where: { id: clientAna.id },
      relations: ['realPerson'],
    });

    const realPersonMaria = mariaClient?.realPerson?.id;
    const realPersonAna = anaClient?.realPerson?.id;

    if (spouseRelation && childRelation && realPersonMaria && realPersonAna) {
      const policyMed = await this.policyService.create({
        policyNumber: 'POL-MED-001',
        businessType: BusinessType.NEW_BUSINESS,
        policyStatusId: activeStatus.id,
        policyCategoryId: individualCategory.id,
        clientId: clientCarlos.id,
        agentId: agent2.id,
        insurerId: insurer2.id,
        planId: planMed.id,
        issuedDate: now.toISOString(),
        validityStart: now.toISOString(),
        validityEnd: nextYear.toISOString(),
        currency: 'USD',
        sumInsured: 100000,
        netPremium: 3500,
        taxAmount: 735,
        totalPremium: 4235,
        commissionPercentage: 10,
        paymentFrequency: 'MONTHLY',
        paymentMethod: 'CREDIT_CARD',
        numberOfInstallments: 12,
        dependents: [
          {
            realPersonId: realPersonMaria,
            relationTypeId: spouseRelation.id,
            deductible: 500,
            status: true,
            notes: 'Cónyuge del titular',
          },
          {
            realPersonId: realPersonAna,
            relationTypeId: childRelation.id,
            deductible: 200,
            status: true,
            notes: 'Hija del titular',
          },
        ],
        additionalCoverages: [
          { coverageName: 'Odontología', insuredValue: 10000 },
        ],
        installments: [
          { installmentNumber: 1, dueDate: now.toISOString(), amount: 352.92, status: 'PAID' },
          { installmentNumber: 2, dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(), amount: 352.92, status: 'PENDING' },
        ],
      });
      this.logger.log(`>> Póliza ${policyMed.policyNumber} creada con 2 dependientes + cobertura odontológica`);
    } else {
      this.logger.warn('⚠️ Faltan catálogos (RelationType/RealPerson) para dependientes. Saltando póliza médica.');
    }

    // ──────────────────────────────────────────
    // 7d. PÓLIZA VIDA (con Beneficiarios)
    // ──────────────────────────────────────────
    this.logger.log('💚 [7d/8] Póliza de Vida Individual...');

    if (spouseRelation && childRelation && realPersonMaria && realPersonAna) {
      const policyLife = await this.policyService.create({
        policyNumber: 'POL-VID-001',
        businessType: BusinessType.NEW_BUSINESS,
        policyStatusId: activeStatus.id,
        policyCategoryId: individualCategory.id,
        clientId: clientJuan.id,
        agentId: agent2.id,
        insurerId: insurer2.id,
        planId: planLife.id,
        issuedDate: now.toISOString(),
        validityStart: now.toISOString(),
        validityEnd: nextYear.toISOString(),
        currency: 'USD',
        sumInsured: 500000,
        netPremium: 8000,
        taxAmount: 1680,
        totalPremium: 9680,
        commissionPercentage: 8,
        paymentFrequency: 'ANNUAL',
        paymentMethod: 'BANK_TRANSFER',
        numberOfInstallments: 1,
        beneficiaries: [
          {
            realPersonId: realPersonMaria,
            relationTypeId: spouseRelation.id,
            percentage: 60,
          },
          {
            realPersonId: realPersonAna,
            relationTypeId: childRelation.id,
            percentage: 40,
          },
        ],
        additionalCoverages: [
          { coverageName: 'Doble Indemnización por Accidente', insuredValue: 500000 },
          { coverageName: 'Invalidez Total y Permanente', insuredValue: 250000 },
        ],
        installments: [
          { installmentNumber: 1, dueDate: now.toISOString(), amount: 9680, status: 'PENDING' },
        ],
      });
      this.logger.log(`>> Póliza ${policyLife.policyNumber} creada con 2 beneficiarios (60%/40%) + 2 coberturas`);
    } else {
      this.logger.warn('⚠️ Faltan catálogos (RelationType/RealPerson) para beneficiarios. Saltando póliza de vida.');
    }

    // ═══════════════════════════════════════════
    // 8. VERIFICACIÓN FINAL
    // ═══════════════════════════════════════════
    this.logger.log('✅ [8/8] Verificación de actualizaciones...');

    await this.agentService.update(agent1.id, { licenseNumber: 'LIC-007-UPD' });
    const updatedAgent = await this.agentService.findOne(agent1.id);
    if (updatedAgent.licenseNumber !== 'LIC-007-UPD') {
      throw new Error('Update Agent falló.');
    }
    this.logger.log('>> Agente actualizado correctamente');

    await this.insurerService.update(insurer1.id, { organizationName: 'Global MVP Updated' });
    const updatedInsurer = await this.insurerService.findOne(insurer1.id);
    if (updatedInsurer.organizationName !== 'Global MVP Updated') {
      throw new Error('Update Insurer falló.');
    }
    this.logger.log('>> Aseguradora actualizada correctamente');

    this.logger.log('═══════════════════════════════════════════════════');
    this.logger.log('  ✅ VERIFICACIÓN COMPLETA — TODO OK');
    this.logger.log('═══════════════════════════════════════════════════');
  }

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────

  private async findCityId(): Promise<string> {
    let city = await this.cityRepo
      .createQueryBuilder('city')
      .innerJoinAndSelect('city.state', 'state')
      .innerJoinAndSelect('state.country', 'country')
      .where('(country.name = :countryName OR country.code = :countryCode)', {
        countryName: 'Argentina',
        countryCode: 'AR',
      })
      .andWhere('(state.nameEs = :stateName OR state.name = :stateName)', { stateName: 'Córdoba' })
      .andWhere('city.name = :cityName', { cityName: 'Córdoba' })
      .getOne();

    if (!city) {
      city = await this.cityRepo
        .createQueryBuilder('city')
        .innerJoinAndSelect('city.state', 'state')
        .innerJoinAndSelect('state.country', 'country')
        .where('country.code = :countryCode', { countryCode: 'AR' })
        .andWhere('state.nameEs = :stateName', { stateName: 'Córdoba' })
        .getOne();
    }

    if (!city) {
      city = await this.cityRepo.findOne({ where: {}, relations: ['state', 'state.country'] });
    }

    if (!city) {
      throw new Error('No se encontraron ciudades. Ejecuta "npm run seed:location" primero.');
    }

    return city.id;
  }

  private async clearExistingData() {
    this.logger.log('🧹 Limpiando datos de prueba anteriores...');

    const policyRepo = this.dataSource.getRepository('Policy');
    const agentRepo = this.dataSource.getRepository('Agent');
    const planRepo = this.dataSource.getRepository('Plan');
    const productRepo = this.dataSource.getRepository('Product');
    const insurerRepo = this.dataSource.getRepository('Insurer');
    const branchRepo = this.dataSource.getRepository('Branch');
    const clientRepo = this.dataSource.getRepository('Client');

    // Eliminar pólizas de prueba (cascade elimina hijos)
    for (const policyNumber of TEST_POLICY_NUMBERS) {
      const policy = await policyRepo.findOne({ where: { policyNumber } });
      if (policy) await policyRepo.remove(policy);
    }

    // Eliminar la póliza vieja (migración)
    const oldPolicy = await policyRepo.findOne({ where: { policyNumber: 'POL-2026-DEMO' } });
    if (oldPolicy) await policyRepo.remove(oldPolicy);

    // Eliminar agentes de prueba
    for (const agentCode of TEST_AGENT_CODES) {
      const agent = await agentRepo.findOne({ where: { agentCode } });
      if (agent) await agentRepo.remove(agent);
    }

    // Eliminar clientes de prueba
    const existingClients = await clientRepo.find({
      relations: ['realPerson', 'realPerson.person', 'realPerson.person.emails'],
    });
    for (const email of TEST_CLIENT_EMAILS) {
      const testClient = existingClients.find((c: any) =>
        c.realPerson?.person?.emails?.some((e: any) => e.account === email),
      );
      if (testClient) await clientRepo.remove(testClient);
    }

    // Eliminar productos y planes (cascada)
    const productCodes = ['PROD-VEH', 'PROD-HOG', 'PROD-MED', 'PROD-VID', 'VID-ELITE'];
    for (const code of productCodes) {
      const product = await productRepo.findOne({ where: { code }, relations: ['plans'] });
      if (product) {
        if (product.plans?.length > 0) await planRepo.remove(product.plans);
        await productRepo.remove(product);
      }
    }

    // Eliminar planes huérfanos
    const planCodes = ['PL-VEH-PREM', 'PL-HOG-TOT', 'PL-MED-FAM', 'PL-VID-PLUS', 'PL-ELITE+'];
    for (const code of planCodes) {
      const plan = await planRepo.findOne({ where: { code } });
      if (plan) await planRepo.remove(plan);
    }

    // Eliminar ramos de prueba
    const branchCodes = ['RAMO-VEH', 'RAMO-HOG', 'RAMO-MED', 'RAMO-VID', 'RAMO-VIDA'];
    for (const code of branchCodes) {
      const branch = await branchRepo.findOne({ where: { code } });
      if (branch) await branchRepo.remove(branch);
    }

    // Eliminar aseguradoras de prueba
    for (const code of TEST_INSURER_CODES) {
      const insurer = await insurerRepo.findOne({ where: { code } });
      if (insurer) await insurerRepo.remove(insurer);
    }

    // Limpiar emails e identificaciones huérfanas
    const allEmails = [...TEST_CLIENT_EMAILS, 'agent.smith@matrix.com', 'lucia.fernandez@agency.com', 'global@mvp.com', 'contacto@mapfre-test.com'];
    await this.dataSource.query(
      `DELETE FROM "email" WHERE account IN (${allEmails.map(e => `'${e}'`).join(',')})`,
    );
    await this.dataSource.query(
      `DELETE FROM "identification" WHERE value IN ('30111222', '28333444', '22555666', '35777888', '25999888', '33111222', '20987654321', '30712345679', '11223344', '99887766')`,
    );

    this.logger.log('🧹 Datos de prueba anteriores limpiados.');
  }
}
