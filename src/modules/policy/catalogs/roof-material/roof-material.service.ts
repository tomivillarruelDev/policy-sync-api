import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { RoofMaterial } from './roof-material.entity';

@Injectable()
export class RoofMaterialService extends BaseService<RoofMaterial> {
    constructor(
        @InjectRepository(RoofMaterial)
        private readonly roofMaterialRepo: Repository<RoofMaterial>,
    ) {
        super(roofMaterialRepo);
    }

    findAll(): Promise<RoofMaterial[]> {
        return this.roofMaterialRepo.find();
    }
}
