import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gender } from '../entities/gender.entity';

@Injectable()
export class GenderService {
    constructor(
        @InjectRepository(Gender)
        private readonly genderRepo: Repository<Gender>,
    ) { }

    findAll(): Promise<Gender[]> {
        return this.genderRepo.find();
    }
}
