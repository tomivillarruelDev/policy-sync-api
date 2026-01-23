import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PolicyCategory } from '../modules/policy/catalogs/policy-category/policy-category.entity';

@Injectable()
export class PolicyCategorySeeder {
    private readonly logger = new Logger(PolicyCategorySeeder.name);

    constructor(
        @InjectRepository(PolicyCategory)
        private readonly policyCategoryRepo: Repository<PolicyCategory>,
    ) { }

    async seed() {
        this.logger.log('--- Iniciando carga de categorías de pólizas ---');
        const categories = [
            { name: 'Individual', slug: 'INDIVIDUAL', nameEs: 'Individual' },
            { name: 'Corporate Mother', slug: 'CORPORATE_MOTHER', nameEs: 'Corporativa Madre' },
            { name: 'Corporate Child', slug: 'CORPORATE_CHILD', nameEs: 'Corporativa Hija' },
            { name: 'Group', slug: 'GROUP', nameEs: 'Grupal' },
        ];

        for (const categoryData of categories) {
            const existing = await this.policyCategoryRepo.findOne({
                where: { slug: categoryData.slug },
            });
            if (!existing) {
                await this.policyCategoryRepo.save(categoryData);
                this.logger.log(`Categoría de póliza creada: ${categoryData.name}`);
            }
        }
        this.logger.log('--- Finalizó la carga de categorías de pólizas ---');
    }
}
