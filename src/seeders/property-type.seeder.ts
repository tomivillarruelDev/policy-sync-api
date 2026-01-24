import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyType } from '../modules/policy/catalogs/property-type/property-type.entity';

@Injectable()
export class PropertyTypeSeeder {
    private readonly logger = new Logger(PropertyTypeSeeder.name);

    constructor(
        @InjectRepository(PropertyType)
        private readonly propertyTypeRepo: Repository<PropertyType>,
    ) { }

    async seed() {
        this.logger.log('--- Iniciando carga de tipos de propiedad ---');
        const types = [
            { name: 'House', slug: 'HOUSE', nameEs: 'Casa' },
            { name: 'Apartment', slug: 'APARTMENT', nameEs: 'Departamento' },
            { name: 'Gated Community House', slug: 'GATED_COMMUNITY', nameEs: 'Casa en Barrio Cerrado/Country' },
            { name: 'Horizontal Property', slug: 'PH', nameEs: 'PH (Propiedad Horizontal)' },
            { name: 'Weekend House', slug: 'WEEKEND_HOUSE', nameEs: 'Casa de Fin de Semana' },
        ];

        for (const typeData of types) {
            const existing = await this.propertyTypeRepo.findOne({
                where: { slug: typeData.slug },
            });
            if (!existing) {
                await this.propertyTypeRepo.save(typeData);
                this.logger.log(`Tipo de propiedad creado: ${typeData.name}`);
            }
        }
        this.logger.log('--- Finalizó la carga de tipos de propiedad ---');
    }
}
