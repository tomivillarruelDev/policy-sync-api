import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { PolicyCategory } from './policy-category.entity';

@Injectable()
export class PolicyCategoryService extends BaseService<PolicyCategory> {
    constructor(
        @InjectRepository(PolicyCategory)
        private readonly policyCategoryRepo: Repository<PolicyCategory>,
    ) {
        super(policyCategoryRepo);
    }

    findAll(): Promise<PolicyCategory[]> {
        return this.policyCategoryRepo.find();
    }
}
