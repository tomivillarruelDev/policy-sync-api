import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { BaseService } from 'src/common/base/base.service';
import { handleDBErrors } from 'src/common/utils/typeorm-errors.util';
import { PLAN_RELATIONS } from '../person/common/constants/relations.constant';

import { Plan } from './entities/plan.entity';
import { PlanDto } from './dto/plan.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class PlanService extends BaseService<Plan, PlanDto> {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    private readonly dataSource: DataSource,
  ) {
    super(planRepository);
  }

  async create(createPlanDto: CreatePlanDto): Promise<PlanDto> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const planRepo = qr.manager.getRepository(Plan);

      const existingPlan = await planRepo.findOne({
        where: { code: createPlanDto.code },
      });

      if (existingPlan)
        throw new BadRequestException(`Plan with code ${createPlanDto.code} already exists`);

      const { productId, ...planData } = createPlanDto;

      const plan = planRepo.create({
        ...planData,
        product: { id: productId } as Product,
      });

      const savedPlan = await planRepo.save(plan);

      await qr.commitTransaction();
      return this.toDto(savedPlan);
    } catch (error) {
      await qr.rollbackTransaction();
      handleDBErrors(error);
    } finally {
      await qr.release();
    }
  }

  async findAll(): Promise<PlanDto[]> {
    const plans = await super.findAll({
      relations: PLAN_RELATIONS,
    });
    return plans.map((plan) => this.toDto(plan as unknown as Plan));
  }

  async findOne(id: string): Promise<PlanDto> {
    const plan = await super.findOne(id, {
      relations: PLAN_RELATIONS,
    });
    return this.toDto(plan as unknown as Plan);
  }

  async update(id: string, updatePlanDto: UpdatePlanDto): Promise<PlanDto> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const planRepo = qr.manager.getRepository(Plan);
      const plan = await planRepo.findOne({
        where: { id },
        relations: PLAN_RELATIONS,
      });

      if (!plan) throw new NotFoundException(`Plan with id ${id} not found`);

      const { productId, ...toUpdate } = updatePlanDto;

      Object.keys(toUpdate).forEach(
        (key) => toUpdate[key] === undefined && delete toUpdate[key],
      );

      Object.assign(plan, toUpdate);


      if (productId) {
        plan.product = { id: productId } as Product;
      }

      await planRepo.save(plan);

      await qr.commitTransaction();
      return this.findOne(id);
    } catch (error) {
      await qr.rollbackTransaction();
      handleDBErrors(error);
    } finally {
      await qr.release();
    }
  }

  private toDto(plan: Plan): PlanDto {
    return plainToInstance(
      PlanDto,
      {
        ...plan,
        productId: plan.product?.id,
        productName: plan.product?.name,
        branchId: plan.product?.branch?.id,
        branchName: plan.product?.branch?.name,
      },
      { excludeExtraneousValues: true },
    );
  }
}
