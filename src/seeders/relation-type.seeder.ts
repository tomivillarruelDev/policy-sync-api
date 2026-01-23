import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RelationType } from '../modules/policy/catalogs/relation-type/relation-type.entity';

@Injectable()
export class RelationTypeSeeder {
    private readonly logger = new Logger(RelationTypeSeeder.name);

    constructor(
        @InjectRepository(RelationType)
        private readonly relationTypeRepo: Repository<RelationType>,
    ) { }

    async seed() {
        this.logger.log('--- Iniciando carga de tipos de relación ---');
        const relationTypes = [
            { name: 'Spouse', slug: 'SPOUSE', nameEs: 'Cónyuge' },
            { name: 'Child', slug: 'CHILD', nameEs: 'Hijo/a' },
            { name: 'Parent', slug: 'PARENT', nameEs: 'Padre/Madre' },
            { name: 'Business Partner', slug: 'PARTNER', nameEs: 'Socio' },
            { name: 'Employee', slug: 'EMPLOYEE', nameEs: 'Empleado' },
            { name: 'Other', slug: 'OTHER', nameEs: 'Otro' },
        ];

        for (const relationData of relationTypes) {
            const existing = await this.relationTypeRepo.findOne({
                where: { slug: relationData.slug },
            });
            if (!existing) {
                await this.relationTypeRepo.save(relationData);
                this.logger.log(`Tipo de relación creado: ${relationData.name}`);
            }
        }
        this.logger.log('--- Finalizó la carga de tipos de relación ---');
    }
}
