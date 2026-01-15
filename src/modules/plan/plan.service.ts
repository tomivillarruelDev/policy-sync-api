import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Plan } from './entities/plan.entity';
import { PlanDto } from './dto/plan.dto';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) { }

  async create(createPlanDto: CreatePlanDto): Promise<PlanDto> {
    try {
      const { productId, ...planData } = createPlanDto;

      const plan = this.planRepository.create({
        ...planData,
        product: { id: productId },
      });

      const saved = await this.planRepository.save(plan);
      return this.findOne(saved.id); // Validar existencia y retornar DTO completo
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(): Promise<PlanDto[]> {
    const plans = await this.planRepository.find({
      relations: ['product'],
    });

    return plans.map((plan) => this.toDto(plan));
  }

  async findOne(id: string): Promise<PlanDto> {
    const plan = await this.planRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!plan) throw new NotFoundException(`Plan with id ${id} not found`);
    return this.toDto(plan);
  }

  async update(id: string, updatePlanDto: UpdatePlanDto): Promise<PlanDto> {
    const { productId, ...toUpdate } = updatePlanDto;

    const plan = await this.planRepository.preload({
      id,
      ...toUpdate,
      ...(productId ? { product: { id: productId } } : {}),
    });

    if (!plan) throw new NotFoundException(`Plan with id ${id} not found`);

    try {
      const saved = await this.planRepository.save(plan);
      return this.findOne(saved.id);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(id: string) {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) throw new NotFoundException(`Plan with id ${id} not found`);

    await this.planRepository.remove(plan);
    return { message: `Plan with id ${id} deleted successfully` };
  }

  private toDto(plan: Plan): PlanDto {
    return plainToInstance(
      PlanDto,
      {
        ...plan,
        productId: plan.product?.id,
        productName: plan.product?.name,
      },
      { excludeExtraneousValues: true },
    );
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23503')
      throw new BadRequestException(
        'Product ID not found or referenced record is invalid',
      );
    if (error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error);
    throw new BadRequestException('Please check server logs');
  }
}
