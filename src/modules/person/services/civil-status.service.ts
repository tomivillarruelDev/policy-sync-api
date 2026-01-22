import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CivilStatus } from '../entities/civil-status.entity';

@Injectable()
export class CivilStatusService {
    constructor(
        @InjectRepository(CivilStatus)
        private readonly civilStatusRepo: Repository<CivilStatus>,
    ) { }

    findAll(): Promise<CivilStatus[]> {
        return this.civilStatusRepo.find();
    }
}
