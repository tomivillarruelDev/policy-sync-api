import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { BaseService } from 'src/common/base/base.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
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

            // 1. Separas los datos del Agente (código, licencias) del resto (nombre, apellido, etc.)
            const { agentCode, licenseNumber, isActive, ...realPersonData } = createAgentDto;
            // 2. Creas todo de una sola vez, anidando objetos
            const agent = agentRepo.create({
                agentCode,
                licenseNumber,
                isActive,
                realPerson: {
                    ...realPersonData,
                    person: personData
                }
            });
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

    async findAllPaginated(paginationDto: PaginationDto): Promise<PaginatedResult<AgentDto>> {
        const result = await super.findAllPaginated(paginationDto, {
            relations: AGENT_RELATIONS,
        });
        return {
            ...result,
            data: result.data.map((i) => this.toDto(i as unknown as Agent)),
        };
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
            const agentRepo = qr.manager.getRepository(Agent);
            const agent = await agentRepo.findOne({
                where: { id },
                relations: AGENT_RELATIONS,
            });

            if (!agent)
                throw new NotFoundException(`Agent with id ${id} not found`);

            const {
                agentCode,
                licenseNumber,
                isActive,
                emails,
                identifications,
                addresses,
                phoneNumbers,
                firstName,
                lastName,
                middleName,
                maternalLastName,
                nationalityId,
                birthDate,
                genderId,
                civilStatusId,
            } = updateAgentDto;

            const agentUpdates = { agentCode, licenseNumber, isActive };
            Object.keys(agentUpdates).forEach(key => agentUpdates[key] === undefined && delete agentUpdates[key]);

            Object.assign(agent, agentUpdates);

            if (agent.realPerson) {
                const personUpdates = {
                    firstName,
                    lastName,
                    middleName,
                    maternalLastName,
                    nationalityId,
                    birthDate,
                    genderId,
                    civilStatusId,
                };

                // Limpiar personUpdates de valores undefined para no sobrescribir
                Object.keys(personUpdates).forEach(key => personUpdates[key] === undefined && delete personUpdates[key]);

                Object.assign(agent.realPerson, personUpdates);

                await validatePersonUniqueConstraints(
                    qr.manager,
                    agent.realPerson.person.id,
                    {
                        emails,
                        identifications: identifications?.map((i) => ({
                            value: i.value,
                            typeId: i.typeId,
                        })),
                    },
                );

                updatePersonFields(agent.realPerson.person, updateAgentDto);

                await qr.manager.getRepository(Person).save(agent.realPerson.person);
                await qr.manager.getRepository(RealPerson).save(agent.realPerson);
            }

            const savedAgent = await agentRepo.save(agent);
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

        // Extraer primer elemento de arrays
        const primaryEmail = personData.emails?.[0];
        const primaryPhone = personData.phoneNumbers?.[0];
        const primaryAddress = personData.addresses?.[0];
        const primaryId = personData.identifications?.[0];

        return plainToInstance(
            AgentDto,
            {
                id: agent.id,
                agentCode: agent.agentCode,
                licenseNumber: agent.licenseNumber,
                isActive: agent.isActive,
                ...personData,

                // Campos aplanados para formulario
                account: primaryEmail?.account,
                phone: primaryPhone?.number,
                street: primaryAddress?.street,
                streetNumber: primaryAddress?.streetNumber,
                city: primaryAddress?.city?.id,
                state: primaryAddress?.city?.state?.id,
                country: primaryAddress?.city?.state?.country?.id,
                identificationType: primaryId?.type?.id,
                identificationValue: primaryId?.value,
            },
            { excludeExtraneousValues: true }
        );
    }
}
