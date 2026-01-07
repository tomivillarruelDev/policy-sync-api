
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { insurerId, ...productData } = createProductDto;
      
      const product = this.productRepository.create({
        ...productData,
        insurer: { id: insurerId },
      });

      return await this.productRepository.save(product);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll() {
    return await this.productRepository.find({
      relations: ['insurer', 'plans'],
    });
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['insurer', 'plans'],
    });

    if (!product) throw new NotFoundException(`Product with id ${ id } not found`);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { insurerId, ...toUpdate } = updateProductDto;
    
    // We preload with partial data. If insurerId comes, we attach it as object
    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
      ...(insurerId ? { insurer: { id: insurerId } } : {}),
    });

    if (!product) throw new NotFoundException(`Product with id ${ id } not found`);

    try {
      return await this.productRepository.save(product);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return { message: `Product with id ${ id } deleted successfully` };
  }

  private handleDBErrors(error: any): never {
    // Check for foreign key violation
    if (error.code === '23503') 
      throw new BadRequestException('Insurer ID not found or referenced record is invalid');
    if (error.code === '23505')
      throw new BadRequestException(error.detail);

    console.log(error);
    throw new BadRequestException('Please check server logs');
  }
}
