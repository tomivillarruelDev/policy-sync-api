import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateInsurerDto } from './dto/create-insurer.dto';
import { UpdateInsurerDto } from './dto/update-insurer.dto';
import { Insurer } from './entities/insurer.entity';
import { LegalPerson } from '../person/entities/legal-person.entity';
import { PersonType } from '../person/enums/person-type.enum';
import { mapPersonData } from '../person/common/mappers';
import { updatePersonFields } from '../person/common/utils/person-update.util';
import { handleDBErrors } from 'src/common/utils/typeorm-errors.util';

@Injectable()
export class InsurerService {
    constructor(
        @InjectRepository(Insurer)
        private readonly insurerRepository: Repository<Insurer>,
        private readonly dataSource: DataSource,
    ) { }

    async create(createInsurerDto: CreateInsurerDto) {
        if (createInsurerDto.legalPerson && createInsurerDto.legalPersonId) {
            throw new BadRequestException('No se puede enviar legalPersonId y legalPerson a la vez');
        }

        if (!createInsurerDto.legalPerson && !createInsurerDto.legalPersonId) {
            throw new BadRequestException('Debe enviar legalPerson (datos) o legalPersonId (existente)');
        }

        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const insurerRepo = qr.manager.getRepository(Insurer);

            const insurer = insurerRepo.create({
                code: createInsurerDto.code,
                executive: createInsurerDto.executive,
                agencyNumber: createInsurerDto.agencyNumber,
                logoUrl: createInsurerDto.logoUrl,
                legalPerson: createInsurerDto.legalPersonId
                    ? { id: createInsurerDto.legalPersonId }
                    : {
                        ...createInsurerDto.legalPerson,
                        person: mapPersonData(createInsurerDto.legalPerson!, PersonType.LEGAL)
                    }
            });

            const saved = await insurerRepo.save(insurer);
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
        return await this.insurerRepository.find({
            relations: ['legalPerson', 'legalPerson.person', 'products'],
        });
    }

    async findOne(id: string) {
        const insurer = await this.insurerRepository.findOne({
            where: { id },
            relations: ['legalPerson', 'legalPerson.person', 'products'],
        });

        if (!insurer) throw new NotFoundException(`Insurer with id ${id} not found`);
        return insurer;
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
                if (updateInsurerDto.legalPersonId !== insurer.legalPerson?.id) {
                    const newLegal = await qr.manager.getRepository(LegalPerson).findOne({ where: { id: updateInsurerDto.legalPersonId } });
                    if (!newLegal) throw new NotFoundException('LegalPerson not found');
                    insurer.legalPerson = newLegal;
                }
            } else if (updateInsurerDto.legalPerson && insurer.legalPerson) {
                if (updateInsurerDto.legalPerson.organizationName) insurer.legalPerson.organizationName = updateInsurerDto.legalPerson.organizationName;
                if (updateInsurerDto.legalPerson.socialReason !== undefined) insurer.legalPerson.socialReason = updateInsurerDto.legalPerson.socialReason;
                if (updateInsurerDto.legalPerson.website !== undefined) insurer.legalPerson.website = updateInsurerDto.legalPerson.website;

                updatePersonFields(insurer.legalPerson.person, updateInsurerDto.legalPerson);
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
        const insurer = await this.findOne(id);
        await this.insurerRepository.remove(insurer);
        return { message: `Insurer with id ${id} deleted successfully` };
    }
}
