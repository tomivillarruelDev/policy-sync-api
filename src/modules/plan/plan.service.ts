import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Plan } from './entities/plan.entity';

@Injectable()
export class PlanService {
    constructor(
        @InjectRepository(Plan)
        private readonly planRepository: Repository<Plan>,
    ) { }

    async create(createPlanDto: CreatePlanDto) {
        try {
            const { productId, ...planData } = createPlanDto;

            const plan = this.planRepository.create({
                ...planData,
                product: { id: productId },
            });

            return await this.planRepository.save(plan);
        } catch (error) {
            this.handleDBErrors(error);
        }
    }

    async findAll() {
        return await this.planRepository.find({
            relations: ['product'],
        });
    }

    async findOne(id: string) {
        const plan = await this.planRepository.findOne({
            where: { id },
            relations: ['product'],
        });

        if (!plan) throw new NotFoundException(`Plan with id ${id} not found`);
        return plan;
    }

    async update(id: string, updatePlanDto: UpdatePlanDto) {
        const { productId, ...toUpdate } = updatePlanDto;

        // Partial update with relation handling
        const plan = await this.planRepository.preload({
            id,
            ...toUpdate,
            ...(productId ? { product: { id: productId } } : {}),
        });

        if (!plan) throw new NotFoundException(`Plan with id ${id} not found`);

        try {
            return await this.planRepository.save(plan);
        } catch (error) {
            this.handleDBErrors(error);
        }
    }

    async remove(id: string) {
        const plan = await this.findOne(id);
        await this.planRepository.remove(plan);
        return { message: `Plan with id ${id} deleted successfully` };
    }

    private handleDBErrors(error: any): never {
        if (error.code === '23503')
            throw new BadRequestException('Product ID not found or referenced record is invalid');
        if (error.code === '23505')
            throw new BadRequestException(error.detail);

        console.log(error);
        throw new BadRequestException('Please check server logs');
    }
}
