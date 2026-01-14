import { Injectable, BadRequestException } from '@nestjs/common';
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

            const personData = mapPersonData(createAgentDto.person, PersonType.REAL);

            if (!personData) {
                throw new BadRequestException('Person data is required');
            }

            const agent = new Agent();
            agent.agentCode = createAgentDto.agentCode;
            if (createAgentDto.licenseNumber) {
                agent.licenseNumber = createAgentDto.licenseNumber;
            }

            agent.realPerson = new RealPerson();
            agent.realPerson.firstName = createAgentDto.person.firstName;
            agent.realPerson.lastName = createAgentDto.person.lastName;
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
            relations: { realPerson: true },
        });
        return agents.map((agent) => this.toDto(agent as unknown as Agent));
    }

    async findOne(id: string): Promise<AgentDto> {
        const agent = await super.findOne(id, {
            relations: { realPerson: true },
        });
        return this.toDto(agent as unknown as Agent);
    }

    private toDto(agent: Agent): AgentDto {
        const flatPerson = PersonDtoMapper.toFlatDto(agent.realPerson);

        return plainToInstance(
            AgentDto,
            {
                id: agent.id,
                agentCode: agent.agentCode,
                licenseNumber: agent.licenseNumber,
                isActive: agent.isActive,

                firstName: flatPerson.firstName,
                lastName: flatPerson.lastName,
                emails: flatPerson.emails,
                phoneNumbers: flatPerson.phoneNumbers,
                identifications: flatPerson.identifications,
                addresses: flatPerson.addresses,
            },
            { excludeExtraneousValues: true }
        );
    }
}
