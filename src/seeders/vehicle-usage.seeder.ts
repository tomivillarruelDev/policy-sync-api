import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleUsage } from '../modules/policy/catalogs/vehicle-usage/vehicle-usage.entity';

@Injectable()
export class VehicleUsageSeeder {
    private readonly logger = new Logger(VehicleUsageSeeder.name);

    constructor(
        @InjectRepository(VehicleUsage)
        private readonly vehicleUsageRepo: Repository<VehicleUsage>,
    ) { }

    async seed() {
        this.logger.log('--- Iniciando carga de tipos de uso de vehículos ---');
        const usages = [
            { name: 'Private', slug: 'PRIVATE', nameEs: 'Particular' },
            { name: 'Commercial', slug: 'COMMERCIAL', nameEs: 'Comercial' },
            { name: 'Public Transport', slug: 'PUBLIC_TRANSPORT', nameEs: 'Transporte Público / App' },
            { name: 'Government', slug: 'GOVERNMENT', nameEs: 'Gubernamental' },
        ];

        for (const usageData of usages) {
            const existing = await this.vehicleUsageRepo.findOne({
                where: { slug: usageData.slug },
            });
            if (!existing) {
                await this.vehicleUsageRepo.save(usageData);
                this.logger.log(`Tipo de uso de vehículo creado: ${usageData.name}`);
            }
        }
        this.logger.log('--- Finalizó la carga de tipos de uso de vehículos ---');
    }
}
