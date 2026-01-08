import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { Agent } from './entities/agent.entity';
import { RealPerson } from '../../entities/real-person.entity';
import { PersonType } from '../../enums/person-type.enum';
import { mapPersonData } from '../../common/mappers';
import { updatePersonFields } from '../../common/utils/person-update.util';
import { handleDBErrors } from 'src/common/utils/typeorm-errors.util';

@Injectable()
export class AgentService {
    private readonly logger = new Logger(AgentService.name);

    constructor(
        @InjectRepository(Agent)
        private readonly agentRepository: Repository<Agent>,
        private readonly dataSource: DataSource,
    ) { }

    async create(createAgentDto: CreateAgentDto) {
        if (createAgentDto.realPerson && createAgentDto.realPersonId) {
            throw new BadRequestException('No se puede enviar realPersonId y realPerson a la vez');
        }

        if (!createAgentDto.realPerson && !createAgentDto.realPersonId) {
            throw new BadRequestException('Debe enviar realPerson (datos) o realPersonId (existente)');
        }

        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const agentRepo = qr.manager.getRepository(Agent);

            const agent = agentRepo.create({
                agentCode: createAgentDto.agentCode,
                licenseNumber: createAgentDto.licenseNumber,
                isActive: createAgentDto.isActive,
                realPerson: createAgentDto.realPersonId
                    ? { id: createAgentDto.realPersonId }
                    : {
                        ...createAgentDto.realPerson,
                        person: mapPersonData(createAgentDto.realPerson!, PersonType.REAL)
                    },
            });

            const saved = await agentRepo.save(agent);
            await qr.commitTransaction();
            return saved;
        } catch (error) {
            await qr.rollbackTransaction();
            handleDBErrors(error);
        } finally {
            await qr.release();
        }
    }

    async findAll() {
        return await this.agentRepository.find({
            relations: ['realPerson', 'realPerson.person'],
        });
    }

    async findOne(id: string) {
        const agent = await this.agentRepository.findOne({
            where: { id },
            relations: ['realPerson', 'realPerson.person'],
        });

        if (!agent) throw new NotFoundException(`Agent with id ${id} not found`);
        return agent;
    }

    async update(id: string, updateAgentDto: UpdateAgentDto) {
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const repo = qr.manager.getRepository(Agent);
            const agent = await repo.findOne({
                where: { id },
                relations: ['realPerson', 'realPerson.person']
            });

            if (!agent) throw new NotFoundException(`Agent with id ${id} not found`);

            if (updateAgentDto.agentCode) agent.agentCode = updateAgentDto.agentCode;
            if (updateAgentDto.licenseNumber) agent.licenseNumber = updateAgentDto.licenseNumber;
            if (updateAgentDto.isActive !== undefined) agent.isActive = updateAgentDto.isActive;

            // Update associated Person
            if (updateAgentDto.realPersonId) {
                if (updateAgentDto.realPersonId !== agent.realPerson?.id) {
                    const newReal = await qr.manager.getRepository(RealPerson).findOne({ where: { id: updateAgentDto.realPersonId } });
                    if (!newReal) throw new NotFoundException('RealPerson not found');
                    agent.realPerson = newReal;
                }
            } else if (updateAgentDto.realPerson && agent.realPerson) {
                if (updateAgentDto.realPerson.firstName) agent.realPerson.firstName = updateAgentDto.realPerson.firstName;
                if (updateAgentDto.realPerson.lastName) agent.realPerson.lastName = updateAgentDto.realPerson.lastName;
                if (updateAgentDto.realPerson.birthDate) agent.realPerson.birthDate = new Date(updateAgentDto.realPerson.birthDate);
                if (updateAgentDto.realPerson.gender) agent.realPerson.gender = updateAgentDto.realPerson.gender;
                if (updateAgentDto.realPerson.civilStatus) agent.realPerson.civilStatus = updateAgentDto.realPerson.civilStatus;
                if (updateAgentDto.realPerson.nationality) agent.realPerson.nationality = updateAgentDto.realPerson.nationality;

                updatePersonFields(agent.realPerson.person, updateAgentDto.realPerson);
                await qr.manager.getRepository(RealPerson).save(agent.realPerson);
            }

            await repo.save(agent);
            await qr.commitTransaction();
            return this.findOne(id);
        } catch (error) {
            await qr.rollbackTransaction();
            handleDBErrors(error);
        } finally {
            await qr.release();
        }
    }

    async remove(id: string) {
        const agent = await this.findOne(id);
        await this.agentRepository.remove(agent);
        return { message: `Agent with id ${id} deleted successfully` };
    }
}
