import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleType } from '../modules/policy/catalogs/vehicle-type/vehicle-type.entity';

@Injectable()
export class VehicleTypeSeeder {
    private readonly logger = new Logger(VehicleTypeSeeder.name);

    constructor(
        @InjectRepository(VehicleType)
        private readonly vehicleTypeRepo: Repository<VehicleType>,
    ) { }

    async seed() {
        this.logger.log('--- Iniciando carga de tipos de vehículos ---');
        const types = [
            { name: 'Car', slug: 'CAR', nameEs: 'Automóvil' },
            { name: 'Motorcycle', slug: 'MOTORCYCLE', nameEs: 'Motocicleta' },
            { name: 'SUV', slug: 'SUV', nameEs: 'SUV' },
            { name: 'Pickup', slug: 'PICKUP', nameEs: 'Camioneta/Pickup' },
            { name: 'Truck', slug: 'TRUCK', nameEs: 'Camión' },
            { name: 'Heavy Machinery', slug: 'HEAVY_MACHINERY', nameEs: 'Maquinaria Pesada' },
        ];

        for (const typeData of types) {
            const existing = await this.vehicleTypeRepo.findOne({
                where: { slug: typeData.slug },
            });
            if (!existing) {
                await this.vehicleTypeRepo.save(typeData);
                this.logger.log(`Tipo de vehículo creado: ${typeData.name}`);
            }
        }
        this.logger.log('--- Finalizó la carga de tipos de vehículos ---');
    }
}
