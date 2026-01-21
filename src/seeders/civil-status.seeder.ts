import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CivilStatus } from '../modules/person/entities/civil-status.entity';

@Injectable()
export class CivilStatusSeeder {
    private readonly logger = new Logger(CivilStatusSeeder.name);

    constructor(
        @InjectRepository(CivilStatus)
        private readonly repository: Repository<CivilStatus>,
    ) { }

    async seed() {
        this.logger.log('--- Seeding Civil Statuses ---');
        const statuses = [
            { name: 'Single', nameEs: 'Soltero/a', slug: 'single' },
            { name: 'Married', nameEs: 'Casado/a', slug: 'married' },
            { name: 'Divorced', nameEs: 'Divorciado/a', slug: 'divorced' },
            { name: 'Widowed', nameEs: 'Viudo/a', slug: 'widowed' },
            { name: 'Separated', nameEs: 'Separado/a', slug: 'separated' },
        ];

        for (const status of statuses) {
            const exists = await this.repository.findOne({ where: { slug: status.slug } });
            if (!exists) {
                await this.repository.save(status);
                this.logger.log(`Created civil status: ${status.name}`);
            }
        }
        this.logger.log('--- Civil Status Seeding Completed ---');
    }
}
