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
    ) { }

    async seed() {
        this.logger.log('--- Iniciando Verificación Completa del Sistema ---');

        await this.clearExistingData();

        // PRELOAD: Obtener Tipos de Identificación
        const dniType = await this.identificationTypeRepo.findOne({ where: { name: 'DNI' } });
        const rucType = await this.identificationTypeRepo.findOne({ where: { name: 'RUC' } });

        // Si no existen, usar el primero que encuentre o fallar controladametne (para MVP asumimos seeded)
        const dniTypeId = dniType?.id;
        const rucTypeId = rucType?.id || dniTypeId; // Fallback

        if (!dniTypeId) {
            this.logger.warn('WARNING: No se encontraron tipos de Identificación (DNI/RUC). Se omitirán identificaciones.');
        }

        // 1. CATALOGOS
        this.logger.log('1. [CATALOG] Creando Aseguradora...');
        const insurer = await this.insurerService.create({
            name: 'Aseguradora Global MVP',
            code: 'GLOB-MVP',
            documentType: 'RUC',
            documentNumber: '20987654321',
            address: 'Centro Financiero',
            email: 'global@mvp.com',
            website: 'https://globalmvp.com',
            phone: '+1234567890',
        });
        this.logger.log(`>> Aseguradora creada: ${insurer.name}`);

        this.logger.log('2. [CATALOG] Creando Producto...');
        const product = await this.productService.create({
            name: 'Vida Individual Elite',
            code: 'VID-ELITE',
            branch: 'Vida',
            insuredAmount: 100000,
            insurerId: insurer.id,
        });
        this.logger.log(`>> Producto creado: ${product.name}`);

        this.logger.log('3. [CATALOG] Creando Plan...');
        const plan = await this.planService.create({
            name: 'Plan Elite Plus',
            code: 'PL-ELITE+',
            deductibleOne: 100,
            productId: product.id,
        });
        this.logger.log(`>> Plan creado: ${plan.name}`);

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
                    cityId: '2b2913d9-9f8a-4057-93c1-51c9885705c9',
                }
            ],
            phoneNumbers: [{ number: '555-1234' }],
            birthDate: '1990-01-01', // Valid date string for DTO? Validation might expect Date or ISO string.
            // Adjusting based on DTO expectation. If DTO has Reference to Enums, use them.
            gender: Gender.MALE,
            civilStatus: CivilStatus.SINGLE,
            nationality: 'AR',
            identifications: []
        };

        if (dniTypeId) {
            clientPayload.identifications.push({ typeId: dniTypeId, value: '11223344' });
        }

        const client = await this.realPersonService.create(clientPayload);
        this.logger.log(`>> Cliente creado: ${client.firstName} ${client.lastName} (ID: ${client.id})`);


        // 3. AGENTE
        this.logger.log('5. [AGENT] Creando Persona para Agente y Rol Agente...');
        const agentPayload: CreateRealPersonDto = {
            firstName: 'Agente',
            lastName: 'Smith',
            emails: [{ account: 'agent.smith@matrix.com' }],
            addresses: [
                {
                    street: 'Matrix St 1',
                    streetNumber: '1',
                    cityId: '2b2913d9-9f8a-4057-93c1-51c9885705c9',
                }
            ],
            phoneNumbers: [{ number: '555-9999' }],
            birthDate: '1985-05-05',
            gender: Gender.MALE,
            civilStatus: CivilStatus.MARRIED,
            nationality: 'US',
            identifications: []
        };

        if (rucTypeId) {
            agentPayload.identifications.push({ typeId: rucTypeId, value: '99887766' });
        }

        const agentPerson = await this.realPersonService.create(agentPayload);
        const agent = await this.agentService.create({
            agentCode: 'AG-007',
            licenseNumber: 'LIC-007',
            isActive: true,
            personId: agentPerson.person.id,
        });
        this.logger.log(`>> Agente creado: ${agent.agentCode} (ID: ${agent.id})`);


        // 4. POLIZA
        this.logger.log('6. [POLICY] Creando Póliza con Dependientes...');
        const policy = await this.policyService.create({
            policyNumber: 'POL-2024-001',
            status: PolicyStatus.ACTIVE,
            businessType: BusinessType.NEW,
            issueDate: new Date(),
            startDate: new Date(),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 año
            insuredAmount: 100000,
            premiumAmount: 1200,
            currency: 'USD',
            paymentFrequency: PaymentFrequency.ANNUAL,
            paymentMethod: PaymentMethod.CREDIT_CARD,
            installments: 1,
            clientId: client.person.id,
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
        this.logger.log(`>> Póliza creada: ${policy.policyNumber} (ID: ${policy.id})`);


        // 5. UPDATES
        this.logger.log('7. [UPDATE] Verificando Actualizaciones...');

        // Update Plan
        await this.planService.update(plan.id, { name: 'Plan Elite Plus (Updated)' });
        const updatedPlan = await this.planService.findOne(plan.id);
        if (updatedPlan.name !== 'Plan Elite Plus (Updated)') throw new Error('Update Plan falló');
        this.logger.log('>> Plan actualizado correctamente');

        // Update Agent
        await this.agentService.update(agent.id, { isActive: false });
        const updatedAgent = await this.agentService.findOne(agent.id);
        if (updatedAgent.isActive !== false) throw new Error('Update Agent falló');
        this.logger.log('>> Agente actualizado correctamente');

        // Update Policy
        await this.policyService.update(policy.id, { insuredAmount: 150000 });
        const updatedPolicy = await this.policyService.findOne(policy.id);
        if (Number(updatedPolicy.insuredAmount) !== 150000) throw new Error('Update Policy falló');
        this.logger.log('>> Póliza actualizada correctamente');

        this.logger.log('--- Verificación Completa Exitosamente ---');
    }
    private async clearExistingData() {
        this.logger.log('Limpiando datos de prueba anteriores...');

        // 1. Dependencies of Policies and Agents
        const policyRepo = this.dataSource.getRepository('Policy');
        const agentRepo = this.dataSource.getRepository('Agent');
        const planRepo = this.dataSource.getRepository('Plan');
        const productRepo = this.dataSource.getRepository('Product');
        const insurerRepo = this.dataSource.getRepository('Insurer');

        // Delete Policy (fetching dependents for TypeORM cascade)
        const policy = await policyRepo.findOne({
            where: { policyNumber: 'POL-2024-001' },
            relations: ['dependents']
        });
        if (policy) await policyRepo.remove(policy);

        // Delete Agent
        const agent = await agentRepo.findOne({ where: { agentCode: 'AG-007' } });
        if (agent) await agentRepo.remove(agent);

        // Delete Plan
        const plan = await planRepo.findOne({ where: { code: 'PL-ELITE+' } });
        if (plan) await planRepo.remove(plan);

        // Delete Product
        const product = await productRepo.findOne({ where: { code: 'VID-ELITE' } });
        if (product) await productRepo.remove(product);

        // Delete Insurer
        const insurer = await insurerRepo.findOne({ where: { code: 'GLOB-MVP' } });
        if (insurer) await insurerRepo.remove(insurer);

        // Clean up Persons by email and ID (identities)
        await this.dataSource.query(`DELETE FROM "email" WHERE account IN ('juan.perez@test.com', 'agent.smith@matrix.com')`);
        await this.dataSource.query(`DELETE FROM "identification" WHERE value IN ('11223344', '99887766')`);

        this.logger.log('Datos de prueba anteriores limpiados.');
    }
}
