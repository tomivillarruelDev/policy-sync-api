import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoofMaterial } from '../modules/policy/catalogs/roof-material/roof-material.entity';

@Injectable()
export class RoofMaterialSeeder {
    private readonly logger = new Logger(RoofMaterialSeeder.name);

    constructor(
        @InjectRepository(RoofMaterial)
        private readonly roofMaterialRepo: Repository<RoofMaterial>,
    ) { }

    async seed() {
        this.logger.log('--- Iniciando carga de materiales de techo ---');
        const materials = [
            { name: 'Concrete Slab', slug: 'CONCRETE', nameEs: 'Losa (Hormigón)' },
            { name: 'Clay Tile', slug: 'TILE', nameEs: 'Tejas' },
            { name: 'Metal Sheet', slug: 'METAL', nameEs: 'Chapa (Zinc/Metal)' },
            { name: 'Wood/Straw', slug: 'WOOD_STRAW', nameEs: 'Madera o Paja (Quincho)' },
        ];

        for (const materialData of materials) {
            const existing = await this.roofMaterialRepo.findOne({
                where: { slug: materialData.slug },
            });
            if (!existing) {
                await this.roofMaterialRepo.save(materialData);
                this.logger.log(`Material de techo creado: ${materialData.name}`);
            }
        }
        this.logger.log('--- Finalizó la carga de materiales de techo ---');
    }
}
