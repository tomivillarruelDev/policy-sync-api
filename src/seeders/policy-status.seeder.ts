import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PolicyStatus } from '../modules/policy/catalogs/policy-status/policy-status.entity';

@Injectable()
export class PolicyStatusSeeder {
    private readonly logger = new Logger(PolicyStatusSeeder.name);

    constructor(
        @InjectRepository(PolicyStatus)
        private readonly policyStatusRepo: Repository<PolicyStatus>,
    ) { }

    async seed() {
        this.logger.log('--- Iniciando carga de estados de pólizas ---');
        const statuses = [
            { name: 'Quoted', slug: 'QUOTED', nameEs: 'Cotizada' },
            { name: 'Active', slug: 'ACTIVE', nameEs: 'Vigente' },
            { name: 'Cancelled', slug: 'CANCELLED', nameEs: 'Anulada' },
            { name: 'Expired', slug: 'EXPIRED', nameEs: 'Vencida' },
            { name: 'Renewed', slug: 'RENEWED', nameEs: 'Renovada' },
            { name: 'Non Renewed', slug: 'NON_RENEWED', nameEs: 'No Renovada' },
        ];

        for (const statusData of statuses) {
            const existing = await this.policyStatusRepo.findOne({
                where: { slug: statusData.slug },
            });
            if (!existing) {
                await this.policyStatusRepo.save(statusData);
                this.logger.log(`Estado de póliza creado: ${statusData.name}`);
            }
        }
        this.logger.log('--- Finalizó la carga de estados de pólizas ---');
    }
}
