import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { AgentDto } from './dto/agent.dto';
import { Agent } from './entities/agent.entity';
import { RealPerson } from '../../entities/real-person.entity';
import { PersonType } from '../../enums/person-type.enum';
import { mapPersonData } from '../../common/mappers';
import { updatePersonFields } from '../../common/utils/person-update.util';
import { handleDBErrors } from 'src/common/utils/typeorm-errors.util';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createAgentDto: CreateAgentDto): Promise<AgentDto> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const agentRepo = qr.manager.getRepository(Agent);

      const personData = mapPersonData(createAgentDto, PersonType.REAL);

      const agent = agentRepo.create({
        agentCode: createAgentDto.agentCode,
        licenseNumber: createAgentDto.licenseNumber,
        isActive: createAgentDto.isActive,
        realPerson: {
          firstName: createAgentDto.firstName,
          lastName: createAgentDto.lastName,
          middleName: createAgentDto.middleName,
          maternalLastName: createAgentDto.maternalLastName,
          nationality: createAgentDto.nationality,
          birthDate: createAgentDto.birthDate
            ? new Date(createAgentDto.birthDate)
            : undefined,
          gender: createAgentDto.gender,
          civilStatus: createAgentDto.civilStatus,
          person: personData,
        } as any,
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
    const agents = await this.agentRepository.find({
      relations: ['realPerson', 'realPerson.person'],
    });
    return agents.map((a) => this.toDto(a));
  }

  async findOne(id: string): Promise<AgentDto> {
    const agent = await this.agentRepository.findOne({
      where: { id },
      relations: ['realPerson', 'realPerson.person'],
    });

    if (!agent) throw new NotFoundException(`Agent with id ${id} not found`);
    return this.toDto(agent);
  }

  async update(id: string, updateAgentDto: UpdateAgentDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const repo = qr.manager.getRepository(Agent);
      const agent = await repo.findOne({
        where: { id },
        relations: ['realPerson', 'realPerson.person'],
      });

      if (!agent) throw new NotFoundException(`Agent with id ${id} not found`);

      if (updateAgentDto.agentCode) agent.agentCode = updateAgentDto.agentCode;
      if (updateAgentDto.licenseNumber)
        agent.licenseNumber = updateAgentDto.licenseNumber;
      if (updateAgentDto.isActive !== undefined)
        agent.isActive = updateAgentDto.isActive;

      if (updateAgentDto.realPersonId) {
        if (updateAgentDto.realPersonId !== agent.realPerson?.id) {
          const newReal = await qr.manager
            .getRepository(RealPerson)
            .findOne({ where: { id: updateAgentDto.realPersonId } });
          if (!newReal) throw new NotFoundException('RealPerson not found');
          agent.realPerson = newReal;
        }
      } else if (agent.realPerson) {
        if (updateAgentDto.firstName)
          agent.realPerson.firstName = updateAgentDto.firstName;
        if (updateAgentDto.lastName)
          agent.realPerson.lastName = updateAgentDto.lastName;
        if (updateAgentDto.birthDate)
          agent.realPerson.birthDate = new Date(updateAgentDto.birthDate);
        if (updateAgentDto.gender)
          agent.realPerson.gender = updateAgentDto.gender;
        if (updateAgentDto.civilStatus)
          agent.realPerson.civilStatus = updateAgentDto.civilStatus;
        if (updateAgentDto.nationality)
          agent.realPerson.nationality = updateAgentDto.nationality;
        if (updateAgentDto.middleName !== undefined)
          agent.realPerson.middleName = updateAgentDto.middleName;
        if (updateAgentDto.maternalLastName !== undefined)
          agent.realPerson.maternalLastName = updateAgentDto.maternalLastName;

        updatePersonFields(agent.realPerson.person, updateAgentDto);
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
    const agent = await this.agentRepository.findOne({ where: { id } });
    if (!agent) throw new NotFoundException(`Agent with id ${id} not found`);
    await this.agentRepository.remove(agent);
    return { message: `Agent with id ${id} deleted successfully` };
  }

  private toDto(agent: Agent): AgentDto {
    return plainToInstance(
      AgentDto,
      {
        id: agent.id,
        agentCode: agent.agentCode,
        licenseNumber: agent.licenseNumber,
        isActive: agent.isActive,
        firstName: agent.realPerson?.firstName,
        lastName: agent.realPerson?.lastName,
        middleName: agent.realPerson?.middleName,
        maternalLastName: agent.realPerson?.maternalLastName,
        nationality: agent.realPerson?.nationality,
        birthDate: agent.realPerson?.birthDate,
        gender: agent.realPerson?.gender,
        civilStatus: agent.realPerson?.civilStatus,
        emails: agent.realPerson?.person?.emails || [],
        phoneNumbers: agent.realPerson?.person?.phoneNumbers || [],
        addresses: agent.realPerson?.person?.addresses || [],
        identifications: agent.realPerson?.person?.identifications || [],
      },
      { excludeExtraneousValues: true },
    );
  }
}
