import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateInsurerDto } from './dto/create-insurer.dto';
import { UpdateInsurerDto } from './dto/update-insurer.dto';
import { InsurerDto } from './dto/insurer.dto';
import { Insurer } from './entities/insurer.entity';
import { LegalPerson } from '../person/entities/legal-person.entity';
import { Person } from '../person/entities/person.entity';
import { PersonType } from '../person/enums/person-type.enum';
import { mapPersonData } from '../person/common/mappers';
import { updatePersonFields } from '../person/common/utils/person-update.util';
import { handleDBErrors } from 'src/common/utils/typeorm-errors.util';
import { plainToInstance } from 'class-transformer';
import { PersonDtoMapper } from '../person/common/mappers/person-dto.mapper';
import { validatePersonUniqueConstraints } from '../person/common/utils/person-validation.util';
import { BaseService } from 'src/common/base/base.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';

import { INSURER_RELATIONS } from '../person/common/constants/relations.constant';

/**
 * Servicio para gestionar Aseguradoras.
 * Extiende BaseService para heredar la funcionalidad genérica de Borrado Lógico.
 * Nota: El Borrado Lógico NO se propaga a entidades relacionadas (ej. LegalPerson, Products) por defecto.
 * Usar lógica específica si se requiere cascada.
 */
@Injectable()
export class InsurerService extends BaseService<Insurer, InsurerDto> {
  constructor(
    @InjectRepository(Insurer)
    private readonly insurerRepository: Repository<Insurer>,
    private readonly dataSource: DataSource,
  ) {
    super(insurerRepository);
  }

  async create(createInsurerDto: CreateInsurerDto): Promise<InsurerDto> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const insurerRepo = qr.manager.getRepository(Insurer);


      const personData = mapPersonData(createInsurerDto, PersonType.LEGAL);

      if (!personData) {
        throw new BadRequestException('Person data is required');
      }

      const {
        code,
        executive,
        agencyNumber,
        logoUrl,
        ...legalPersonData
      } = createInsurerDto;

      const insurer = insurerRepo.create({
        code,
        executive,
        agencyNumber,
        logoUrl,
        legalPerson: {
          ...legalPersonData,
          person: personData,
        },
      });

      const saved = await insurerRepo.save(insurer);
      await qr.commitTransaction();
      return this.toDto(saved);
    } catch (error) {
      await qr.rollbackTransaction();
      handleDBErrors(error);
    } finally {
      await qr.release();
    }
  }

  async findAll(): Promise<InsurerDto[]> {
    const insurers = await super.findAll({
      relations: INSURER_RELATIONS,
    });
    return insurers.map((i) => this.toDto(i as unknown as Insurer));
  }

  async findAllPaginated(paginationDto: PaginationDto): Promise<PaginatedResult<InsurerDto>> {
    const result = await super.findAllPaginated(paginationDto, {
      relations: INSURER_RELATIONS,
    });
    return {
      ...result,
      data: result.data.map((i) => this.toDto(i as unknown as Insurer)),
    };
  }

  async findOne(id: string): Promise<InsurerDto> {
    const insurer = await super.findOne(id, {
      relations: INSURER_RELATIONS,
    });
    return this.toDto(insurer as unknown as Insurer);
  }

  async update(id: string, updateInsurerDto: UpdateInsurerDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const insurerRepo = qr.manager.getRepository(Insurer);
      const insurer = await insurerRepo.findOne({
        where: { id },
        relations: INSURER_RELATIONS,
      });

      if (!insurer)
        throw new NotFoundException(`Insurer with id ${id} not found`);

      const {
        legalPersonId,
        emails,
        identifications,
        addresses,
        phoneNumbers,
        organizationName,
        socialReason,
        website,
        ...directUpdates
      } = updateInsurerDto;



      const insurerUpdates = {
        code: directUpdates.code,
        executive: directUpdates.executive,
        agencyNumber: directUpdates.agencyNumber,
        logoUrl: directUpdates.logoUrl
      };

      // Removemos undefined para que Object.assign no sobrescriba con undefined si falta en DTO
      Object.keys(insurerUpdates).forEach(key => insurerUpdates[key] === undefined && delete insurerUpdates[key]);

      Object.assign(insurer, insurerUpdates);

      if (legalPersonId) {
        if (legalPersonId !== insurer.legalPerson?.id) {
          const newLegal = await qr.manager
            .getRepository(LegalPerson)
            .findOne({ where: { id: legalPersonId } });
          if (!newLegal) throw new NotFoundException('LegalPerson not found');
          insurer.legalPerson = newLegal;
        }
      } else if (insurer.legalPerson) {
        // Actualización anidada de LegalPerson con whitelist explícita
        const legalUpdates = { organizationName, socialReason, website };
        Object.keys(legalUpdates).forEach(key => legalUpdates[key] === undefined && delete legalUpdates[key]);

        Object.assign(insurer.legalPerson, legalUpdates);

        await validatePersonUniqueConstraints(
          qr.manager,
          insurer.legalPerson.person.id,
          {
            emails,
            identifications: identifications?.map((i) => ({
              value: i.value,
              typeId: i.typeId,
            })),
          },
        );

        updatePersonFields(insurer.legalPerson.person, updateInsurerDto);

        await qr.manager.getRepository(Person).save(insurer.legalPerson.person);

        await qr.manager.getRepository(LegalPerson).save(insurer.legalPerson);
      }

      await insurerRepo.save(insurer);
      await qr.commitTransaction();
      return this.findOne(id);
    } catch (error) {
      await qr.rollbackTransaction();
      handleDBErrors(error);
    } finally {
      await qr.release();
    }
  }



  private toDto(insurer: Insurer): InsurerDto {
    const flatPerson = PersonDtoMapper.toFlatDto(insurer.legalPerson);

    // Extraer primer elemento de arrays
    const primaryEmail = flatPerson.emails?.[0];
    const primaryPhone = flatPerson.phoneNumbers?.[0];
    const primaryAddress = flatPerson.addresses?.[0];
    const primaryId = flatPerson.identifications?.[0];

    return plainToInstance(
      InsurerDto,
      {
        id: insurer.id,
        code: insurer.code,
        executive: insurer.executive,
        agencyNumber: insurer.agencyNumber,
        logoUrl: insurer.logoUrl,

        // Mapeado vía PersonDtoMapper
        organizationName: flatPerson.organizationName,
        socialReason: flatPerson.socialReason,
        website: flatPerson.website,
        emails: flatPerson.emails,
        phoneNumbers: flatPerson.phoneNumbers,
        addresses: flatPerson.addresses,
        identifications: flatPerson.identifications,

        // Campos aplanados para formulario
        name: flatPerson.organizationName,  // Alias
        account: primaryEmail?.account,
        phone: primaryPhone?.number,
        address: primaryAddress?.street,
        city: primaryAddress?.city?.id,
        state: primaryAddress?.city?.state?.id,
        country: primaryAddress?.city?.state?.country?.id,
        identificationType: primaryId?.type?.id,
        identificationValue: primaryId?.value,
      },
      { excludeExtraneousValues: true },
    );
  }
}
