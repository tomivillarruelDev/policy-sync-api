import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gender } from '../modules/person/entities/gender.entity';

@Injectable()
export class GenderSeeder {
    private readonly logger = new Logger(GenderSeeder.name);

    constructor(
        @InjectRepository(Gender)
        private readonly genderRepo: Repository<Gender>,
    ) { }

    async seed() {
        this.logger.log('--- Seeding Genders ---');
        const genders = [
            { name: 'Male', slug: 'male', nameEs: 'Masculino' },
            { name: 'Female', slug: 'female', nameEs: 'Femenino' },
            { name: 'Other', slug: 'other', nameEs: 'Otro' },
        ];

        for (const genderData of genders) {
            const existing = await this.genderRepo.findOne({
                where: { slug: genderData.slug },
            });
            if (!existing) {
                await this.genderRepo.save(genderData);
                this.logger.log(`Created gender: ${genderData.name}`);
            }
        }
        this.logger.log('--- Gender Seeding Completed ---');
    }
}
