import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { BaseService } from 'src/common/base/base.service';
import { Agent } from './entities/agent.entity';
import { AgentDto } from './dto/agent.dto';
import { CreateAgentDto } from './dto/create-agent.dto';
import { RealPerson } from '../person/entities/real-person.entity';
import { PersonType } from '../person/enums/person-type.enum';
import { mapPersonData } from '../person/common/mappers';
import { handleDBErrors } from 'src/common/utils/typeorm-errors.util';
import { PersonDtoMapper } from '../person/common/mappers/person-dto.mapper';
import { AGENT_RELATIONS } from '../person/common/constants/relations.constant';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { validatePersonUniqueConstraints } from '../person/common/utils/person-validation.util';
import { updatePersonFields } from '../person/common/utils/person-update.util';
import { Person } from '../person/entities/person.entity';

@Injectable()
export class AgentService extends BaseService<Agent, AgentDto> {
    constructor(
        @InjectRepository(Agent)
        private readonly agentRepository: Repository<Agent>,
        private readonly dataSource: DataSource,
    ) {
        super(agentRepository);
    }

    async create(createAgentDto: CreateAgentDto): Promise<AgentDto> {
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const agentRepo = qr.manager.getRepository(Agent);

            const personData = mapPersonData(createAgentDto, PersonType.REAL);

            if (!personData) {
                throw new BadRequestException('Person data is required');
            }

            const agent = new Agent();
            agent.agentCode = createAgentDto.agentCode;
            agent.isActive = createAgentDto.isActive!;
            agent.licenseNumber = createAgentDto.licenseNumber || null;

            agent.realPerson = new RealPerson();
            agent.realPerson.firstName = createAgentDto.firstName;
            agent.realPerson.lastName = createAgentDto.lastName;
            agent.realPerson.person = personData;

            const saved = await agentRepo.save(agent);
            await qr.commitTransaction();

            return this.toDto(saved);
        } catch (error) {
            await qr.rollbackTransaction();
            handleDBErrors(error);
        } finally {
            await qr.release();
        }
    }

    async findAll(): Promise<AgentDto[]> {
        const agents = await super.findAll({
            relations: AGENT_RELATIONS,
        });
        return agents.map((i) => this.toDto(i as unknown as Agent));
    }

    async findOne(id: string): Promise<AgentDto> {
        const agent = await super.findOne(id, {
            relations: AGENT_RELATIONS,
        });
        return this.toDto(agent as unknown as Agent);
    }


    async update(id: string, updateAgentDto: UpdateAgentDto) {
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const repo = qr.manager.getRepository(Agent);
            const agent = await repo.findOne({
                where: { id },
                relations: AGENT_RELATIONS,
            });

            if (!agent)
                throw new NotFoundException(`Agent with id ${id} not found`);

            if (updateAgentDto.agentCode) agent.agentCode = updateAgentDto.agentCode;
            if (updateAgentDto.licenseNumber !== undefined)
                agent.licenseNumber = updateAgentDto.licenseNumber;
            if (updateAgentDto.isActive !== undefined)
                agent.isActive = updateAgentDto.isActive;

            if (agent.realPerson) {
                if (updateAgentDto.firstName) agent.realPerson.firstName = updateAgentDto.firstName;
                if (updateAgentDto.lastName) agent.realPerson.lastName = updateAgentDto.lastName;
                if (updateAgentDto.middleName !== undefined) agent.realPerson.middleName = updateAgentDto.middleName;
                if (updateAgentDto.maternalLastName !== undefined) agent.realPerson.maternalLastName = updateAgentDto.maternalLastName;
                if (updateAgentDto.nationality !== undefined) agent.realPerson.nationality = updateAgentDto.nationality;
                if (updateAgentDto.birthDate !== undefined) agent.realPerson.birthDate = updateAgentDto.birthDate;
                if (updateAgentDto.gender !== undefined) agent.realPerson.gender = updateAgentDto.gender;
                if (updateAgentDto.civilStatus !== undefined) agent.realPerson.civilStatus = updateAgentDto.civilStatus;

                await validatePersonUniqueConstraints(
                    qr.manager,
                    agent.realPerson.person.id,
                    {
                        emails: updateAgentDto.emails,
                        identifications: updateAgentDto.identifications?.map((i) => ({
                            value: i.value,
                            typeId: i.typeId,
                        })),
                    },
                );

                updatePersonFields(agent.realPerson.person, updateAgentDto);

                await qr.manager.getRepository(Person).save(agent.realPerson.person);
                await qr.manager.getRepository(RealPerson).save(agent.realPerson);
            }

            const savedAgent = await repo.save(agent);
            await qr.commitTransaction();

            return this.findOne(savedAgent.id);
        } catch (error) {
            await qr.rollbackTransaction();
            handleDBErrors(error);
        } finally {
            await qr.release();
        }
    }


    private toDto(agent: Agent): AgentDto {
        const personData = PersonDtoMapper.toFlatDto(agent.realPerson);

        return plainToInstance(
            AgentDto,
            {
                id: agent.id,
                agentCode: agent.agentCode,
                licenseNumber: agent.licenseNumber,
                isActive: agent.isActive,
                ...personData
            },
            { excludeExtraneousValues: true }
        );
    }
}
