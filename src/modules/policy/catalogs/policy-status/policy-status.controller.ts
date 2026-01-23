import { Controller, Get } from '@nestjs/common';
import { PolicyStatusService } from './policy-status.service';
import { PolicyStatus } from './policy-status.entity';

@Controller('policy-statuses')
export class PolicyStatusController {
    constructor(private readonly policyStatusService: PolicyStatusService) { }

    @Get()
    findAll(): Promise<PolicyStatus[]> {
        return this.policyStatusService.findAll();
    }
}
