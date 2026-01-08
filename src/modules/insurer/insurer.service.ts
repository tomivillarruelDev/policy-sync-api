import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateInsurerDto } from './dto/create-insurer.dto';
import { UpdateInsurerDto } from './dto/update-insurer.dto';
import { InsurerDto } from './dto/insurer.dto';
import { Insurer } from './entities/insurer.entity';
import { LegalPerson } from '../person/entities/legal-person.entity';
import { PersonType } from '../person/enums/person-type.enum';
import { mapPersonData } from '../person/common/mappers';
import { updatePersonFields } from '../person/common/utils/person-update.util';
import { handleDBErrors } from 'src/common/utils/typeorm-errors.util';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class InsurerService {
    constructor(
        @InjectRepository(Insurer)
        private readonly insurerRepository: Repository<Insurer>,
        private readonly dataSource: DataSource,
    ) { }

    async create(createInsurerDto: CreateInsurerDto): Promise<InsurerDto> {
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const insurerRepo = qr.manager.getRepository(Insurer);

            // Extract person data
            const personData = mapPersonData(createInsurerDto, PersonType.LEGAL);

            const insurer = insurerRepo.create({
                code: createInsurerDto.code,
                executive: createInsurerDto.executive,
                agencyNumber: createInsurerDto.agencyNumber,
                logoUrl: createInsurerDto.logoUrl,
                legalPerson: {
                    organizationName: createInsurerDto.organizationName,
                    socialReason: createInsurerDto.socialReason,
                    website: createInsurerDto.website,
                    person: personData
                }
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
        const insurers = await this.insurerRepository.find({
            relations: ['legalPerson', 'legalPerson.person', 'products'],
        });
        return insurers.map(i => this.toDto(i));
    }

    async findOne(id: string): Promise<InsurerDto> {
        const insurer = await this.insurerRepository.findOne({
            where: { id },
            relations: ['legalPerson', 'legalPerson.person', 'products'],
        });

        if (!insurer) throw new NotFoundException(`Insurer with id ${id} not found`);
        return this.toDto(insurer);
    }

    async update(id: string, updateInsurerDto: UpdateInsurerDto) {
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const repo = qr.manager.getRepository(Insurer);
            const insurer = await repo.findOne({
                where: { id },
                relations: ['legalPerson', 'legalPerson.person']
            });

            if (!insurer) throw new NotFoundException(`Insurer with id ${id} not found`);

            // Update flat fields
            if (updateInsurerDto.code) insurer.code = updateInsurerDto.code;
            if (updateInsurerDto.executive !== undefined) insurer.executive = updateInsurerDto.executive;
            if (updateInsurerDto.agencyNumber !== undefined) insurer.agencyNumber = updateInsurerDto.agencyNumber;
            if (updateInsurerDto.logoUrl !== undefined) insurer.logoUrl = updateInsurerDto.logoUrl;

            // Update LegalPerson
            if (updateInsurerDto.legalPersonId) {
                // Logic for switching legal person (if needed)
                if (updateInsurerDto.legalPersonId !== insurer.legalPerson?.id) {
                    const newLegal = await qr.manager.getRepository(LegalPerson).findOne({ where: { id: updateInsurerDto.legalPersonId } });
                    if (!newLegal) throw new NotFoundException('LegalPerson not found');
                    insurer.legalPerson = newLegal;
                }
            } else if (insurer.legalPerson) {
                if (updateInsurerDto.organizationName) insurer.legalPerson.organizationName = updateInsurerDto.organizationName;
                if (updateInsurerDto.socialReason !== undefined) insurer.legalPerson.socialReason = updateInsurerDto.socialReason;
                if (updateInsurerDto.website !== undefined) insurer.legalPerson.website = updateInsurerDto.website;

                updatePersonFields(insurer.legalPerson.person, updateInsurerDto);
                await qr.manager.getRepository(LegalPerson).save(insurer.legalPerson);
            }

            await repo.save(insurer);
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
        const insurer = await this.insurerRepository.findOne({ where: { id } });
        if (!insurer) throw new NotFoundException(`Insurer with id ${id} not found`);
        await this.insurerRepository.remove(insurer);
        return { message: `Insurer with id ${id} deleted successfully` };
    }

    private toDto(insurer: Insurer): InsurerDto {
        return plainToInstance(InsurerDto, {
            id: insurer.id,
            code: insurer.code,
            executive: insurer.executive,
            agencyNumber: insurer.agencyNumber,
            logoUrl: insurer.logoUrl,
            organizationName: insurer.legalPerson?.organizationName,
            socialReason: insurer.legalPerson?.socialReason,
            website: insurer.legalPerson?.website,
            emails: insurer.legalPerson?.person?.emails || [],
            phoneNumbers: insurer.legalPerson?.person?.phoneNumbers || [],
            addresses: insurer.legalPerson?.person?.addresses || [],
            identifications: insurer.legalPerson?.person?.identifications || [],
        }, { excludeExtraneousValues: true });
    }
}
