import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { RelationType } from './relation-type.entity';

@Injectable()
export class RelationTypeService extends BaseService<RelationType> {
    constructor(
        @InjectRepository(RelationType)
        private readonly relationTypeRepo: Repository<RelationType>,
    ) {
        super(relationTypeRepo);
    }

    findAll(): Promise<RelationType[]> {
        return this.relationTypeRepo.find();
    }
}
