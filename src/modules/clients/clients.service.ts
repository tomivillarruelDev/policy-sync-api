import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

// Base & Utils
import { BaseService } from '../../common/base/base.service';
import { handleDBErrors } from '../../common/utils/typeorm-errors.util';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

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

            // 2. Map Person Data
            const personData = mapPersonData(createDto, PersonType.REAL);
            if (!personData) throw new BadRequestException('Person data is required');

            // 3. Extraer datos específicos del Cliente — isActive siempre true (regla de negocio)
            const { isActive: _ignored, ...realPersonData } = createDto;

            const client = repo.create({
                isActive: true,
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

    // --- FIND ALL PAGINATED ---
    async findAllPaginated(paginationDto: PaginationDto): Promise<PaginatedResult<ClientDto>> {
        const result = await super.findAllPaginated(paginationDto, {
            relations: CLIENT_RELATIONS,
        });
        return {
            ...result,
            data: result.data.map(item => this.toDto(item as unknown as Client)),
        };
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
                isActive,
                emails,
                identifications,
                addresses,
                phoneNumbers,
                ...personData // Extract all person data (scalars + nested)
            } = updateDto;

            // 2.1 Actualizaciones directas del Cliente — isActive siempre true (regla de negocio)
            const clientUpdates = { isActive: true };
            Object.assign(entity, clientUpdates);

            // 2.2 Handle RealPerson Updates (Whitelist Approach)
            if (entity.realPerson) {
                // Explicit whitelist for RealPerson scalars
                const {
                    firstName,
                    lastName,
                    middleName,
                    maternalLastName,
                    nationalityId,
                    birthDate,
                    genderId,
                    civilStatusId,
                } = personData as any; // Cast to access potential properties

                const realPersonUpdates = {
                    firstName,
                    lastName,
                    middleName,
                    maternalLastName,
                    nationalityId,
                    birthDate,
                    genderId,
                    civilStatusId,
                };

                // Filter undefined values
                Object.keys(realPersonUpdates).forEach(
                    (key) =>
                        realPersonUpdates[key] === undefined &&
                        delete realPersonUpdates[key],
                );

                Object.assign(entity.realPerson, realPersonUpdates);

                // 2.3 Handle Nested Person Fields (Emails, etc)
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
                    await qr.manager
                        .getRepository(Person)
                        .save(entity.realPerson.person);
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
        // Extraer primer elemento de arrays
        const primaryEmail = entity.realPerson?.person?.emails?.[0];
        const primaryPhone = entity.realPerson?.person?.phoneNumbers?.[0];
        const primaryAddress = entity.realPerson?.person?.addresses?.[0];
        const primaryId = entity.realPerson?.person?.identifications?.[0];

        return plainToInstance(ClientDto, {
            ...entity,
            // Mapear escalares de RealPerson aplanados
            firstName: entity.realPerson?.firstName,
            lastName: entity.realPerson?.lastName,
            birthDate: entity.realPerson?.birthDate,
            gender: entity.realPerson?.gender,
            genderId: entity.realPerson?.genderId || entity.realPerson?.gender?.id,
            civilStatusId: entity.realPerson?.civilStatusId || entity.realPerson?.civilStatus?.id,
            nationalityId: entity.realPerson?.nationalityId || entity.realPerson?.nationality?.id,
            personId: entity.realPerson?.person?.id,

            // Aplanar campos de contacto
            account: primaryEmail?.account,
            phone: primaryPhone?.number,

            // Aplanar campos de dirección
            street: primaryAddress?.street,
            streetNumber: primaryAddress?.streetNumber,
            city: primaryAddress?.city?.id,
            state: primaryAddress?.city?.state?.id,
            country: primaryAddress?.city?.state?.country?.id,

            // Aplanar campos de identificación
            identificationType: primaryId?.type?.id,
            identificationValue: primaryId?.value,

            // Mapear colecciones de Person completas (para otros usos)
            emails: entity.realPerson?.person?.emails,
            phoneNumbers: entity.realPerson?.person?.phoneNumbers,
            identifications: entity.realPerson?.person?.identifications,
            addresses: entity.realPerson?.person?.addresses,
        }, { excludeExtraneousValues: true });
    }
}
