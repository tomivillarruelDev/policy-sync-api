import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { Policy } from './entities/policy.entity';

@Injectable()
export class PolicyService {
    constructor(
        @InjectRepository(Policy)
        private readonly policyRepository: Repository<Policy>,
    ) { }

    async create(createPolicyDto: CreatePolicyDto) {
        try {
            const { clientId, agentId, planId, dependents, ...policyData } = createPolicyDto;

            const policy = this.policyRepository.create({
                ...policyData,
                client: { id: clientId },
                agent: { id: agentId },
                plan: { id: planId },
                dependents: dependents, // Cascade will handle this
            });

            return await this.policyRepository.save(policy);
        } catch (error) {
            this.handleDBErrors(error);
        }
    }

    async findAll() {
        return await this.policyRepository.find({
            relations: ['client', 'agent', 'plan', 'dependents'],
        });
    }

    async findOne(id: string) {
        const policy = await this.policyRepository.findOne({
            where: { id },
            relations: ['client', 'agent', 'plan', 'dependents'],
        });

        if (!policy) throw new NotFoundException(`Policy with id ${id} not found`);
        return policy;
    }

    async update(id: string, updatePolicyDto: UpdatePolicyDto) {
        const { clientId, agentId, planId, dependents, ...toUpdate } = updatePolicyDto;

        // Handle relations update if provided
        const preloadData: any = {
            id,
            ...toUpdate,
        };

        if (clientId) preloadData.client = { id: clientId };
        if (agentId) preloadData.agent = { id: agentId };
        if (planId) preloadData.plan = { id: planId };

        // Note: Updating dependents via simple patch is complex with TypeORM (replace vs update). 
        // For MVP, we might treat dependents as "replace existing" or handle separately.
        // However, if passed here, TypeORM with cascade might try to insert/update. 
        // Usually requires manual handling for deletion of orphans if replacing entire list.
        // For now, we allow updating the scalar fields and main relations. dependent updates might require specific endpoint or care.
        if (dependents) preloadData.dependents = dependents;

        const policy = await this.policyRepository.preload(preloadData);

        if (!policy) throw new NotFoundException(`Policy with id ${id} not found`);

        try {
            return await this.policyRepository.save(policy);
        } catch (error) {
            this.handleDBErrors(error);
        }
    }

    async remove(id: string) {
        const policy = await this.findOne(id);
        await this.policyRepository.remove(policy);
        return { message: `Policy with id ${id} deleted successfully` };
    }

    private handleDBErrors(error: any): never {
        if (error.code === '23503')
            throw new BadRequestException('Foreign key constraint violation (Client, Agent or Plan ID invalid)');
        if (error.code === '23505')
            throw new BadRequestException(error.detail);

        console.log(error);
        throw new BadRequestException('Please check server logs');
    }
}
