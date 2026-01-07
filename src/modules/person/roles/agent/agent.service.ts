import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { Agent } from './entities/agent.entity';

@Injectable()
export class AgentService {
    constructor(
        @InjectRepository(Agent)
        private readonly agentRepository: Repository<Agent>,
    ) { }

    async create(createAgentDto: CreateAgentDto) {
        try {
            const { personId, ...agentData } = createAgentDto;

            const agent = this.agentRepository.create({
                ...agentData,
                person: { id: personId },
            });

            return await this.agentRepository.save(agent);
        } catch (error) {
            this.handleDBErrors(error);
        }
    }

    async findAll() {
        return await this.agentRepository.find({
            relations: ['person'],
        });
    }

    async findOne(id: string) {
        const agent = await this.agentRepository.findOne({
            where: { id },
            relations: ['person'],
        });

        if (!agent) throw new NotFoundException(`Agent with id ${id} not found`);
        return agent;
    }

    async update(id: string, updateAgentDto: UpdateAgentDto) {
        const { personId, ...toUpdate } = updateAgentDto;

        // Si viene personId, también lo actualizamos
        const agent = await this.agentRepository.preload({
            id,
            ...toUpdate,
            ...(personId ? { person: { id: personId } } : {}),
        });

        if (!agent) throw new NotFoundException(`Agent with id ${id} not found`);

        try {
            return await this.agentRepository.save(agent);
        } catch (error) {
            this.handleDBErrors(error);
        }
    }

    async remove(id: string) {
        const agent = await this.findOne(id);
        await this.agentRepository.remove(agent);
        return { message: `Agent with id ${id} deleted successfully` };
    }

    private handleDBErrors(error: any): never {
        if (error.code === '23503')
            throw new BadRequestException('Person ID not found or referenced record is invalid');
        if (error.code === '23505')
            throw new BadRequestException(error.detail);

        console.log(error);
        throw new BadRequestException('Please check server logs');
    }
}
