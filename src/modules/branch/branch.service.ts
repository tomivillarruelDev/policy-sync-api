import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { BaseService } from '../../common/base/base.service';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { handleDBErrors } from '../../common/utils/typeorm-errors.util';
import { BRANCH_RELATIONS } from '../person/common/constants/relations.constant';

import { Branch } from './entities/branch.entity';
import { BranchDto } from './dto/branch.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Insurer } from '../insurer/entities/insurer.entity';

@Injectable()
export class BranchService extends BaseService<Branch, BranchDto> {
    constructor(
        @InjectRepository(Branch)
        private readonly branchRepository: Repository<Branch>,
        private readonly dataSource: DataSource,
    ) {
        super(branchRepository);
    }

    async create(createDto: CreateBranchDto): Promise<BranchDto> {
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const branchRepo = qr.manager.getRepository(Branch);

            const exsistingBranch = await branchRepo.findOne({
                where: { code: createDto.code },
            });

            if (exsistingBranch)
                throw new BadRequestException(`Branch with code ${createDto.code} already exists`);

            const { insurerId, ...branchData } = createDto;

            const entity = branchRepo.create({
                ...branchData,
                insurer: { id: insurerId } as Insurer,
            });

            const saved = await branchRepo.save(entity);

            await qr.commitTransaction();
            return this.toDto(saved);
        } catch (error) {
            await qr.rollbackTransaction();
            handleDBErrors(error);
        } finally {
            await qr.release();
        }
    }

    async findAll(): Promise<BranchDto[]> {
        const entities = await super.findAll({
            relations: BRANCH_RELATIONS,
        });
        return entities.map((item) => this.toDto(item as unknown as Branch));
    }

    async findAllPaginated(paginationDto: PaginationDto): Promise<PaginatedResult<BranchDto>> {
        const result = await super.findAllPaginated(paginationDto, {
            relations: BRANCH_RELATIONS,
        });
        return {
            ...result,
            data: result.data.map((item) => this.toDto(item as unknown as Branch)),
        };
    }

    async findOne(id: string): Promise<BranchDto> {
        const entity = await super.findOne(id, {
            relations: BRANCH_RELATIONS,
        });
        return this.toDto(entity as unknown as Branch);
    }

    async update(id: string, updateDto: UpdateBranchDto): Promise<BranchDto> {
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const branchRepo = qr.manager.getRepository(Branch);

            const entity = await branchRepo.findOne({
                where: { id },
                relations: BRANCH_RELATIONS,
            });

            if (!entity) throw new NotFoundException(`Branch with id ${id} not found`);

            const { insurerId, ...updateData } = updateDto;

            Object.keys(updateData).forEach(
                (key) => updateData[key] === undefined && delete updateData[key],
            );

            Object.assign(entity, updateData);

            if (insurerId) {
                entity.insurer = { id: insurerId } as Insurer;
            }

            await branchRepo.save(entity);

            await qr.commitTransaction();
            return this.findOne(id);
        } catch (error) {
            await qr.rollbackTransaction();
            handleDBErrors(error);
        } finally {
            await qr.release();
        }
    }

    private toDto(entity: Branch): BranchDto {
        return plainToInstance(
            BranchDto,
            {
                ...entity,
                insurerId: entity.insurer?.id,
                insurerName: entity.insurer?.legalPerson?.organizationName,
            },
            { excludeExtraneousValues: true },
        );
    }
}
