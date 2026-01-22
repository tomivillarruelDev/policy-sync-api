import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nationality } from '../entities/nationality.entity';

@Injectable()
export class NationalityService {
    constructor(
        @InjectRepository(Nationality)
        private readonly nationalityRepository: Repository<Nationality>,
    ) { }

    async findAll(): Promise<Nationality[]> {
        return this.nationalityRepository.find();
    }
}
