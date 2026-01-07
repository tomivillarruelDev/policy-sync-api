import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInsurerDto } from './dto/create-insurer.dto';
import { UpdateInsurerDto } from './dto/update-insurer.dto';
import { Insurer } from './entities/insurer.entity';

@Injectable()
export class InsurerService {
    constructor(
        @InjectRepository(Insurer)
        private readonly insurerRepository: Repository<Insurer>,
    ) { }

    async create(createInsurerDto: CreateInsurerDto) {
        try {
            const insurer = this.insurerRepository.create(createInsurerDto);
            // Si viniera countryId, aquí haríamos la búsqueda del Country para asignarlo
            // if (createInsurerDto.countryId) { ... }

            return await this.insurerRepository.save(insurer);
        } catch (error) {
            this.handleDBErrors(error);
        }
    }

    async findAll() {
        return await this.insurerRepository.find({
            relations: ['products'],
        });
    }

    async findOne(id: string) {
        const insurer = await this.insurerRepository.findOne({
            where: { id },
            relations: ['products'],
        });

        if (!insurer) throw new NotFoundException(`Insurer with id ${id} not found`);
        return insurer;
    }

    async update(id: string, updateInsurerDto: UpdateInsurerDto) {
        const insurer = await this.findOne(id);

        // TypeORM's preload or merge is useful here, but simple object assign is clearest for partial updates 
        // when we fetched the entity first.
        // this.insurerRepository.merge(insurer, updateInsurerDto); 

        const updatedInsurer = await this.insurerRepository.preload({
            id: id,
            ...updateInsurerDto,
        });

        if (!updatedInsurer) throw new NotFoundException(`Insurer with id ${id} not found`);

        try {
            return await this.insurerRepository.save(updatedInsurer);
        } catch (error) {
            this.handleDBErrors(error);
        }
    }

    async remove(id: string) {
        const insurer = await this.findOne(id);
        await this.insurerRepository.remove(insurer);
        return { message: `Insurer with id ${id} deleted successfully` };
    }

    private handleDBErrors(error: any): never {
        if (error.code === '23505')
            throw new BadRequestException(error.detail);

        console.log(error);
        throw new BadRequestException('Please check server logs');
    }
}
