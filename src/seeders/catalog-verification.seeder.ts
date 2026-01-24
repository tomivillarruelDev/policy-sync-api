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
import { CreateRealPersonDto } from '../modules/person/dto/create-real-person.dto';
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
  ) { }

  async seed() {
    this.logger.log(
      '--- Iniciando Verificación Completa del Sistema (Refactorizado) ---',
    );

    await this.clearExistingData();

    await this.identificationSeeder.seed();
    await this.genderSeeder.seed();
    await this.civilStatusSeeder.seed();
    await this.nationalitySeeder.seed();

    const maleGender = await this.genderRepo.findOne({ where: { slug: 'male' } });
    if (!maleGender) this.logger.warn('Gender MALE not found. Make sure GenderSeeder runs.');

    const singleStatus = await this.civilStatusRepo.findOne({ where: { slug: 'single' } });
    if (!singleStatus) this.logger.warn('CivilStatus SINGLE not found.');

    const argentinaNationality = await this.nationalityRepo.findOne({ where: { name: 'Argentine' } });
    if (!argentinaNationality) this.logger.warn('Nationality Argentine not found.');

    const dniType = await this.identificationTypeRepo.findOne({
      where: { name: 'DNI' },
    });
    const rucType = await this.identificationTypeRepo.findOne({
      where: { name: 'RUC' },
    });
    const dniTypeId = dniType?.id;
    const rucTypeId = rucType?.id || dniTypeId;

    // PRELOAD: Obtener Ubicación Específica (Argentina > Córdoba > Córdoba)
    this.logger.log('Buscando ciudad específica: Argentina > Córdoba > Córdoba...');

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
      this.logger.warn('No se encontró Córdoba en Argentina. Intentando buscar cualquier ciudad de Córdoba...');
      city = await this.cityRepo
        .createQueryBuilder('city')
        .innerJoinAndSelect('city.state', 'state')
        .innerJoinAndSelect('state.country', 'country')
        .where('country.code = :countryCode', { countryCode: 'AR' })
        .andWhere('state.nameEs = :stateName', { stateName: 'Córdoba' })
        .getOne();
    }

    if (!city) {
      this.logger.warn('FALLBACK: No se encontró Madrid. Usando cualquier ciudad disponible.');
      city = await this.cityRepo.findOne({ where: {}, relations: ['state', 'state.country'] });
    }

    if (!city) {
      throw new Error(
        'No se encontraron ciudades. Ejecuta "npm run seed:location" primero.',
      );
    }
    const cityId = city.id;
    this.logger.log(`>> Ubicación encontrada: ${city.name} (Ciudad) > ${city.state?.nameEs} (Estado) > ${city.state?.country?.nameEs} (País)`);

    // 1. CATALOGOS
    this.logger.log(
      '1. [CATALOG] Creando Aseguradora (con LegalPerson anidada -> FLATTENED)...',
    );
    const insurerPayload: CreateInsurerDto = {
      code: 'GLOB-MVP',
      executive: 'Juan Ejecutivo',
      organizationName: 'Aseguradora Global MVP',
      socialReason: 'Global MVP S.A.',
      emails: [{ account: 'global@mvp.com' }],
      addresses: [
        {
          street: 'Centro Financiero',
          streetNumber: '100',
          cityId: cityId,
        },
      ],
      phoneNumbers: [{ number: '+1234567890' }],
      identifications: rucTypeId
        ? [{ typeId: rucTypeId, value: '20987654321' }]
        : [],
    };
    const insurerCreated = await this.insurerService.create(insurerPayload);

    const insurer = await this.insurerService.findOne(insurerCreated.id);

    this.logger.log(
      `>> Aseguradora creada y recuperada: ${insurer.organizationName} (ID: ${insurer.id})`,
    );

    // VERIFICACION CRITICA: Address Flattening
    if (insurer.addresses && insurer.addresses.length > 0) {
      const addr = insurer.addresses[0];
      this.logger.log(
        `>> Verificando Address Flattening IDs: CityId=${addr.cityId}, StateId=${addr.stateId}, CountryId=${addr.countryId}`,
      );

      const country = await this.dataSource.getRepository('Country').findOne({ where: { id: addr.countryId } });
      const state = await this.dataSource.getRepository('State').findOne({ where: { id: addr.stateId } });
      const city = await this.dataSource.getRepository('City').findOne({ where: { id: addr.cityId } });

      this.logger.log(`>> RESULTADO FINAL (DB): País="${country?.nameEs}", Estado="${state?.nameEs}", Ciudad="${city?.name}"`);

      if (!addr.street || !addr.countryId || !addr.stateId) {
        throw new Error(
          'CRITICAL: Address Flattening failed. Street, CountryId or StateId is missing in Backend Response.',
        );
      }
    } else {
      throw new Error('CRITICAL: No addresses returned for Insurer.');
    }

    this.logger.log('2. [CATALOG] Creando Ramo (Branch)...');
    const branch = await this.branchService.create({
      name: 'Vida',
      code: 'RAMO-VIDA',
      insurerId: insurer.id,
    });

    this.logger.log('3. [CATALOG] Creando Producto...');
    const product = await this.productService.create({
      name: 'Vida Individual Elite',
      code: 'VID-ELITE',
      branchId: branch.id,
      insuredAmount: 100000,
      insurerId: insurer.id,
    });

    this.logger.log('3. [CATALOG] Creando Plan...');
    const plan = await this.planService.create({
      name: 'Plan Elite Plus',
      code: 'PL-ELITE+',
      deductibleOne: 100,
      productId: product.id,
    });

    // 2. PERSONA (Cliente)
    this.logger.log('4. [CLIENT] Creando Cliente (Client Entity wrapping RealPerson)...');
    const clientPayload: CreateClientDto = {
      firstName: 'Juan',
      lastName: 'Perez',
      emails: [{ account: 'juan.perez@test.com' }],
      addresses: [
        {
          street: 'Calle Falsa 123',
          streetNumber: '123',
          cityId: cityId,
        },
      ],
      phoneNumbers: [{ number: '555-1234' }],
      birthDate: new Date('1990-01-01'),
      genderId: maleGender?.id,
      civilStatusId: singleStatus?.id,
      nationalityId: argentinaNationality?.id,
      identifications: dniTypeId
        ? [{ typeId: dniTypeId, value: '11223344' }]
        : [],
      isActive: true,
    };
    const client = await this.clientsService.create(clientPayload);
    this.logger.log(
      `>> Cliente creado: ${client.firstName} ${client.lastName} (ID: ${client.id})`,
    );

    // 3. AGENTE (Con RealPerson Anidada -> FLATTENED)
    this.logger.log('5. [AGENT] Creando Agente con RealPerson anidada...');
    const agentPayload: CreateAgentDto = {
      agentCode: 'AG-007',
      licenseNumber: 'LIC-007',
      firstName: 'Agente',
      lastName: 'Smith',
      emails: [{ account: 'agent.smith@matrix.com' }],
      addresses: [
        {
          street: 'Matrix St',
          streetNumber: '1',
          cityId: cityId,
        },
      ],
      phoneNumbers: [{ number: '555-9999' }],
      birthDate: new Date('1985-05-05'),
      genderId: maleGender?.id,
      identifications: rucTypeId
        ? [{ typeId: rucTypeId, value: '99887766' }]
        : [],
    };
    const agent = await this.agentService.create(agentPayload);
    this.logger.log(
      `>> Agente creado: ${agent.firstName} ${agent.lastName} (ID: ${agent.id})`,
    );

    // 4. POLIZA (NUEVA ESTRUCTURA COMPLETA)
    this.logger.log('6. [POLICY] Creando Póliza Completa (Auto + Hogar + Cuotas)...');

    // Buscamos catálogos necesarios (Status y Category)
    // Nota: Asumimos que los seeders de catálogos ya corrieron.
    const activeStatus = await this.dataSource.getRepository('PolicyStatus').findOne({ where: { slug: 'ACTIVE' } });
    const individualCategory = await this.dataSource.getRepository('PolicyCategory').findOne({ where: { slug: 'INDIVIDUAL' } });

    if (!activeStatus || !individualCategory) {
      this.logger.warn('⚠️ Faltan catálogos de Póliza (Status/Category). Saltando creación de póliza.');
    } else {
      // Creamos la póliza con toda la estructura anidada
      const newPolicy = await this.policyService.create({
        // --- Header ---
        policyNumber: 'POL-2026-DEMO',
        businessType: BusinessType.NEW_BUSINESS,
        policyStatusId: activeStatus.id,
        policyCategoryId: individualCategory.id,
        clientId: client.id,
        agentId: agent.id,
        insurerId: insurer.id,
        planId: plan.id,

        // --- Fechas ---
        issuedDate: new Date().toISOString(),
        validityStart: new Date().toISOString(),
        validityEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // 1 año
        renewalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),

        // --- Financials ---
        currency: 'USD',
        sumInsured: 50000,
        netPremium: 1000,
        taxAmount: 210,
        totalPremium: 1210,
        commissionPercentage: 10,
        paymentFrequency: 'ANNUAL',
        paymentMethod: 'CREDIT_CARD',
        numberOfInstallments: 1,

        // --- DETALLES DE RIESGO (Test de Relaciones Hijas) ---

        // 1. Vehículo (Datos de la captura)
        vehicles: [{
          brand: 'KIA',
          model: 'SONET',
          version: 'LX 1.5',
          year: 2023,
          plate: 'PDX-9085',
          insuredValue: 21640.70,
          countryId: city.state.country.id, // País de la ubicación
          address: 'Córdoba Capital', // Zona de riesgo (Texto)
        }],

        // 2. Hogar
        properties: [{
          cityId: cityId, // Relación con City
          street: 'Av. Siempre Viva',
          streetNumber: '742',
          buildingFireSum: 150000,
          contentFireSum: 50000,
        }],

        // 3. Cuotas (Grilla de Pagos)
        installments: [{
          installmentNumber: 1,
          dueDate: new Date().toISOString(),
          amount: 1210,
          status: 'PENDING',
        }],
      });

      this.logger.log(`>> Póliza ${newPolicy.policyNumber} creada exitosamente con sus detalles.`);
    }

    // 5. UPDATES
    this.logger.log('7. [UPDATE] Verificando Actualizaciones...');

    await this.agentService.update(agent.id, {
      licenseNumber: 'LIC-007-UPDATED',
    });

    const updatedAgent = await this.agentService.findOne(agent.id);
    if (updatedAgent.licenseNumber !== 'LIC-007-UPDATED') {
      throw new Error(
        `Update Agent falló. Esperado: 'LIC-007-UPDATED', Actual: '${updatedAgent.licenseNumber}'`,
      );
    }
    this.logger.log(
      '>> Agente actualizado correctamente (Update simple funcionó)',
    );

    await this.insurerService.update(insurer.id, {
      organizationName: 'Global MVP Updated',
    });
    const updatedInsurer = await this.insurerService.findOne(insurer.id);
    if (updatedInsurer.organizationName !== 'Global MVP Updated') {
      throw new Error('Update Insurer falló en actualización plana');
    }
    this.logger.log('>> Aseguradora actualizada correctamente (Update plano)');

    this.logger.log('--- Verificación Completa Exitosamente ---');
  }

  private async clearExistingData() {
    this.logger.log('Limpiando datos de prueba anteriores...');

    const policyRepo = this.dataSource.getRepository('Policy');
    const agentRepo = this.dataSource.getRepository('Agent');
    const planRepo = this.dataSource.getRepository('Plan');
    const productRepo = this.dataSource.getRepository('Product');
    const insurerRepo = this.dataSource.getRepository('Insurer');

    const branchRepo = this.dataSource.getRepository('Branch');

    const policy = await policyRepo.findOne({
      where: { policyNumber: 'POL-2026-DEMO' },
    });
    if (policy) await policyRepo.remove(policy);

    const agent = await agentRepo.findOne({ where: { agentCode: 'AG-007' } });
    if (agent) await agentRepo.remove(agent);

    const clientRepo = this.dataSource.getRepository('Client');
    const existingClients = await clientRepo.find({
      relations: ['realPerson', 'realPerson.person', 'realPerson.person.emails'],
    });
    const testClient = existingClients.find(c =>
      c.realPerson?.person?.emails?.some(e => e.account === 'juan.perez@test.com')
    );
    if (testClient) {
      await clientRepo.remove(testClient);
    }

    const product = await productRepo.findOne({
      where: { code: 'VID-ELITE' },
      relations: ['plans'],
    });

    if (product) {

      if (product.plans && product.plans.length > 0) {
        await planRepo.remove(product.plans);
      }

      await productRepo.remove(product);
    }

    const plan = await planRepo.findOne({ where: { code: 'PL-ELITE+' } });
    if (plan) await planRepo.remove(plan);

    const branch = await branchRepo.findOne({ where: { code: 'RAMO-VIDA' } });
    if (branch) await branchRepo.remove(branch);

    const insurer = await insurerRepo.findOne({ where: { code: 'GLOB-MVP' } });
    if (insurer) await insurerRepo.remove(insurer);

    await this.dataSource.query(
      `DELETE FROM "email" WHERE account IN ('juan.perez@test.com', 'agent.smith@matrix.com', 'global@mvp.com')`,
    );
    await this.dataSource.query(
      `DELETE FROM "identification" WHERE value IN ('11223344', '99887766', '20987654321')`,
    );

    this.logger.log('Datos de prueba anteriores limpiados.');
  }
}
