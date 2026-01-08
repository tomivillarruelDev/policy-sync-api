import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { InsurerService } from '../modules/insurer/insurer.service';
import { ProductService } from '../modules/product/product.service';
import { PlanService } from '../modules/plan/plan.service';
import { RealPersonService } from '../modules/person/services/real-person.service';
import { AgentService } from '../modules/person/roles/agent/agent.service';
import { PolicyService } from '../modules/policy/policy.service';
import { PolicyStatus } from '../modules/policy/enums/policy-status.enum';
import { BusinessType } from '../modules/policy/enums/business-type.enum';
import { PaymentFrequency } from '../modules/policy/enums/payment-frequency.enum';
import { PaymentMethod } from '../modules/policy/enums/payment-method.enum';
import { RelationType } from '../modules/policy/enums/relation-type.enum';
import { CivilStatus } from '../modules/person/enums/civil-status.enum';
import { Gender } from '../modules/person/enums/gender.enum';
import { IdentificationType } from '../modules/person/common/identification/entity/identification-type.entity';
import { CreateRealPersonDto } from '../modules/person/dto/create-real-person.dto';
import { CreateInsurerDto } from '../modules/insurer/dto/create-insurer.dto';
import { CreateAgentDto } from '../modules/person/roles/agent/dto/create-agent.dto';
import { IdentificationSeeder } from './identification.seeder';

@Injectable()
export class CatalogVerificationSeeder {
    private readonly logger = new Logger(CatalogVerificationSeeder.name);

    constructor(
        private readonly insurerService: InsurerService,
        private readonly productService: ProductService,
        private readonly planService: PlanService,
        private readonly realPersonService: RealPersonService,
        private readonly agentService: AgentService,
        private readonly policyService: PolicyService,
        private readonly dataSource: DataSource,
        @InjectRepository(IdentificationType)
        private readonly identificationTypeRepo: Repository<IdentificationType>,
        private readonly identificationSeeder: IdentificationSeeder,
    ) { }

    async seed() {
        this.logger.log('--- Iniciando Verificación Completa del Sistema (Refactorizado) ---');

        await this.clearExistingData();

        // 0. PRELOAD: Seed Identification Types
        await this.identificationSeeder.seed();

        // PRELOAD: Obtener Tipos de Identificación
        const dniType = await this.identificationTypeRepo.findOne({ where: { name: 'DNI' } });
        const rucType = await this.identificationTypeRepo.findOne({ where: { name: 'RUC' } });
        const dniTypeId = dniType?.id;
        const rucTypeId = rucType?.id || dniTypeId;

        // 1. CATALOGOS
        this.logger.log('1. [CATALOG] Creando Aseguradora (con LegalPerson anidada -> FLATTENED)...');
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
                    cityId: 'fb134761-7298-462d-a0da-a280e0d9b78e',
                }
            ],
            phoneNumbers: [{ number: '+1234567890' }],
            identifications: rucTypeId ? [{ typeId: rucTypeId, value: '20987654321' }] : []
        };
        const insurer = await this.insurerService.create(insurerPayload);
        // Note: InsurerService now returns InsurerDto (flat), so we access organizationName directly
        this.logger.log(`>> Aseguradora creada: ${insurer.organizationName} (ID: ${insurer.id})`);

        this.logger.log('2. [CATALOG] Creando Producto...');
        const product = await this.productService.create({
            name: 'Vida Individual Elite',
            code: 'VID-ELITE',
            branch: 'Vida',
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
        this.logger.log('4. [PERSON] Creando Cliente (RealPerson)...');
        const clientPayload: CreateRealPersonDto = {
            firstName: 'Juan',
            lastName: 'Perez',
            emails: [{ account: 'juan.perez@test.com' }],
            addresses: [
                {
                    street: 'Calle Falsa 123',
                    streetNumber: '123',
                    cityId: 'fb134761-7298-462d-a0da-a280e0d9b78e',
                }
            ],
            phoneNumbers: [{ number: '555-1234' }],
            birthDate: '1990-01-01',
            gender: Gender.MALE,
            civilStatus: CivilStatus.SINGLE,
            nationality: 'AR',
            identifications: dniTypeId ? [{ typeId: dniTypeId, value: '11223344' }] : []
        };
        const client = await this.realPersonService.create(clientPayload);

        // 3. AGENTE (Con RealPerson Anidada -> FLATTENED)
        this.logger.log('5. [AGENT] Creando Agente con RealPerson anidada...');
        const agentPayload: CreateAgentDto = {
            agentCode: 'AG-007',
            licenseNumber: 'LIC-007',
            isActive: true,
            firstName: 'Agente',
            lastName: 'Smith',
            emails: [{ account: 'agent.smith@matrix.com' }],
            addresses: [{ street: 'Matrix St', streetNumber: '1', cityId: 'fb134761-7298-462d-a0da-a280e0d9b78e' }],
            phoneNumbers: [{ number: '555-9999' }],
            birthDate: '1985-05-05',
            gender: Gender.MALE,
            identifications: rucTypeId ? [{ typeId: rucTypeId, value: '99887766' }] : []
        };
        const agent = await this.agentService.create(agentPayload);
        // Note: AgentService now returns AgentDto (flat)
        this.logger.log(`>> Agente creado: ${agent.firstName} ${agent.lastName} (ID: ${agent.id})`);

        // 4. POLIZA
        this.logger.log('6. [POLICY] Creando Póliza con Dependientes...');
        const policy = await this.policyService.create({
            policyNumber: 'POL-2024-001',
            status: PolicyStatus.ACTIVE,
            businessType: BusinessType.NEW,
            issueDate: new Date(),
            startDate: new Date(),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            insuredAmount: 100000,
            premiumAmount: 1200,
            currency: 'USD',
            paymentFrequency: PaymentFrequency.ANNUAL,
            paymentMethod: PaymentMethod.CREDIT_CARD,
            installments: 1,
            clientId: client.person.id,  // Client is Person (via RealPerson)
            agentId: agent.id,
            planId: plan.id,
            dependents: [
                {
                    firstName: 'Hijo',
                    lastName: 'Perez',
                    relationType: RelationType.CHILD,
                    birthDate: new Date('2020-01-01'),
                }
            ]
        });

        // 5. UPDATES
        this.logger.log('7. [UPDATE] Verificando Actualizaciones...');

        // Update Agent: changing lastName (Flattened)
        await this.agentService.update(agent.id, {
            lastName: 'Smith Neo', // Flattened update
        });

        const updatedAgent = await this.agentService.findOne(agent.id);
        if (updatedAgent.lastName !== 'Smith Neo') {
            throw new Error(`Update Agent falló. Esperado: 'Smith Neo', Actual: '${updatedAgent.lastName}'`);
        }
        this.logger.log('>> Agente actualizado correctamente (Update plano funcionó)');

        // Update Insurer
        await this.insurerService.update(insurer.id, {
            organizationName: 'Global MVP Updated' // Flattened update
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

        const policy = await policyRepo.findOne({ where: { policyNumber: 'POL-2024-001' } });
        if (policy) await policyRepo.remove(policy);

        const agent = await agentRepo.findOne({ where: { agentCode: 'AG-007' } });
        if (agent) await agentRepo.remove(agent);

        const plan = await planRepo.findOne({ where: { code: 'PL-ELITE+' } });
        if (plan) await planRepo.remove(plan);

        const product = await productRepo.findOne({ where: { code: 'VID-ELITE' } });
        if (product) await productRepo.remove(product);

        const insurer = await insurerRepo.findOne({ where: { code: 'GLOB-MVP' } });
        if (insurer) await insurerRepo.remove(insurer);

        // Manual cleanup via SQL to be safe purely for seed data
        await this.dataSource.query(`DELETE FROM "email" WHERE account IN ('juan.perez@test.com', 'agent.smith@matrix.com', 'global@mvp.com')`);
        await this.dataSource.query(`DELETE FROM "identification" WHERE value IN ('11223344', '99887766', '20987654321')`);

        this.logger.log('Datos de prueba anteriores limpiados.');
    }
}
