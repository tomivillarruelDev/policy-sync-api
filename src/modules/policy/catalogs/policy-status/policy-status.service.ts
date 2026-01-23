import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { PolicyStatus } from './policy-status.entity';

@Injectable()
export class PolicyStatusService extends BaseService<PolicyStatus> {
    constructor(
        @InjectRepository(PolicyStatus)
        private readonly policyStatusRepo: Repository<PolicyStatus>,
    ) {
        super(policyStatusRepo);
    }

    findAll(): Promise<PolicyStatus[]> {
        return this.policyStatusRepo.find();
    }
}
