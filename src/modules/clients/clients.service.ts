import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

// Base & Utils
import { BaseService } from '../../common/base/base.service';
import { handleDBErrors } from '../../common/utils/typeorm-errors.util';

// Module Imports
import { Client } from './entities/client.entity';
import { ClientDto } from './dto/client.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

// Person Module Shared
import { CLIENT_RELATIONS } from '../person/common/constants/relations.constant';
import { PersonDtoMapper } from '../person/common/mappers/person-dto.mapper';
import { mapPersonData } from '../person/common/mappers';
import { PersonType } from '../person/enums/person-type.enum';
import { validatePersonUniqueConstraints } from '../person/common/utils/person-validation.util';
import { updatePersonFields } from '../person/common/utils/person-update.util';
import { Person } from '../person/entities/person.entity';
import { RealPerson } from '../person/entities/real-person.entity';

@Injectable()
export class ClientsService extends BaseService<Client, ClientDto> {
    constructor(
        @InjectRepository(Client)
        private readonly clientRepository: Repository<Client>,
        private readonly dataSource: DataSource,
    ) {
        super(clientRepository);
    }

    // --- CREATE (Transactional) ---
    async create(createDto: CreateClientDto): Promise<ClientDto> {
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const repo = qr.manager.getRepository(Client);

            // 1. Business Validations
            const exists = await repo.findOne({ where: { clientCode: createDto.clientCode } });
            if (exists) throw new BadRequestException('Client Code already exists');

            // 2. Map Person Data
            const personData = mapPersonData(createDto, PersonType.REAL);
            if (!personData) throw new BadRequestException('Person data is required');

            // 3. Extract Client specific data
            const { clientCode, isActive, ...realPersonData } = createDto;

            const client = repo.create({
                clientCode,
                isActive,
                realPerson: {
                    ...realPersonData, // firstName, etc.
                    person: personData // nested person (emails, etc.)
                }
            });

            const saved = await repo.save(client);

            await qr.commitTransaction();
            return this.toDto(saved);
        } catch (error) {
            await qr.rollbackTransaction();
            handleDBErrors(error);
        } finally {
            await qr.release();
        }
    }

    // --- FIND ALL (Override) ---
    async findAll(): Promise<ClientDto[]> {
        const entities = await super.findAll({
            relations: CLIENT_RELATIONS,
        });
        return entities.map(item => this.toDto(item as unknown as Client));
    }

    // --- FIND ONE (Override) ---
    async findOne(id: string): Promise<ClientDto> {
        const entity = await super.findOne(id, {
            relations: CLIENT_RELATIONS,
        });
        return this.toDto(entity as unknown as Client);
    }

    // --- UPDATE (Transactional) ---
    async update(id: string, updateDto: UpdateClientDto): Promise<ClientDto> {
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const repo = qr.manager.getRepository(Client);

            // 1. Verify existence with relations
            const entity = await repo.findOne({
                where: { id },
                relations: CLIENT_RELATIONS,
            });

            if (!entity) throw new NotFoundException(`Client with id ${id} not found`);

            // 2. Scalable Update
            const {
                clientCode,
                isActive,
                emails,
                identifications,
                addresses,
                phoneNumbers,
                ...personData
            } = updateDto;

            if (clientCode) entity.clientCode = clientCode;
            if (isActive !== undefined) entity.isActive = isActive;

            // Handle RealPerson and Person updates
            if (entity.realPerson) {
                Object.assign(entity.realPerson, personData);

                // Update Nested Person Fields (Emails, etc)
                if (entity.realPerson.person) {
                    await validatePersonUniqueConstraints(
                        qr.manager,
                        entity.realPerson.person.id,
                        {
                            emails,
                            identifications: identifications?.map((i) => ({
                                value: i.value,
                                typeId: i.typeId,
                            })),
                        },
                    );

                    updatePersonFields(entity.realPerson.person, updateDto);
                    await qr.manager.getRepository(Person).save(entity.realPerson.person);
                }

                await qr.manager.getRepository(RealPerson).save(entity.realPerson);
            }

            await repo.save(entity);

            await qr.commitTransaction();
            return this.findOne(id); // Return updated
        } catch (error) {
            await qr.rollbackTransaction();
            handleDBErrors(error);
        } finally {
            await qr.release();
        }
    }

    // --- MAPPER ---
    private toDto(entity: Client): ClientDto {
        return plainToInstance(ClientDto, {
            ...entity,
            // Map RealPerson scalars flattened
            firstName: entity.realPerson?.firstName,
            lastName: entity.realPerson?.lastName,
            // Map Person collections fully (no flattening to string)
            emails: entity.realPerson?.person?.emails,
            phoneNumbers: entity.realPerson?.person?.phoneNumbers,
            identifications: entity.realPerson?.person?.identifications,
            addresses: entity.realPerson?.person?.addresses,
        }, { excludeExtraneousValues: true });
    }
}
