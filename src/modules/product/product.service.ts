import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductDto } from './dto/product.dto';
import { plainToInstance } from 'class-transformer';
import { Product } from './entities/product.entity';
import { Insurer } from '../insurer/entities/insurer.entity';
import { Branch } from '../branch/entities/branch.entity';
import { BaseService } from 'src/common/base/base.service';
import { generateAutoCode } from 'src/common/utils/code-generator.util';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { PRODUCT_RELATIONS } from '../person/common/constants/relations.constant';
import { handleDBErrors } from 'src/common/utils/typeorm-errors.util';

@Injectable()
export class ProductService extends BaseService<Product, ProductDto> {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {
    super(productRepository);
  }

  async create(createProductDto: CreateProductDto): Promise<ProductDto> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const productRepo = qr.manager.getRepository(Product);

      const code = generateAutoCode('PRD');
      const existingProduct = await productRepo.findOne({
        where: { code },
      });

      if (existingProduct)
        throw new BadRequestException(`Product with code ${code} already exists`);

      const { insurerId, branchId, code: _ignoredCode, ...planData } = createProductDto;

      const product = productRepo.create({
        ...planData,
        code,
        insurer: { id: insurerId } as Insurer,
        branch: { id: branchId } as Branch,
      });

      const savedProduct = await productRepo.save(product);
      await qr.commitTransaction();
      return this.toDto(savedProduct);
    } catch (error) {
      await qr.rollbackTransaction();
      handleDBErrors(error);
    } finally {
      await qr.release();
    }
  }

  async findAll(): Promise<ProductDto[]> {
    const products = await super.findAll({
      relations: PRODUCT_RELATIONS,
    });
    return products.map((i) => this.toDto(i as unknown as Product));
  }

  async findAllPaginated(paginationDto: PaginationDto): Promise<PaginatedResult<ProductDto>> {
    const result = await super.findAllPaginated(paginationDto, {
      relations: PRODUCT_RELATIONS,
    });
    return {
      ...result,
      data: result.data.map((i) => this.toDto(i as unknown as Product)),
    };
  }

  async findOne(id: string): Promise<ProductDto> {
    const product = await super.findOne(id, {
      relations: PRODUCT_RELATIONS,
    });
    return this.toDto(product as unknown as Product);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const productRepo = qr.manager.getRepository(Product);
      const product = await productRepo.findOne({
        where: { id },
        relations: PRODUCT_RELATIONS,
      });

      if (!product)
        throw new NotFoundException(`Product with id ${id} not found`);

      const { insurerId, branchId, code: _ignoredCode, ...productData } = updateProductDto;

      Object.keys(productData).forEach(
        (key) => productData[key] === undefined && delete productData[key],
      );

      Object.assign(product, productData);

      if (insurerId) {
        product.insurer = { id: insurerId } as Insurer;
      }
      if (branchId) {
        product.branch = { id: branchId } as Branch;
      }

      await productRepo.save(product);
      await qr.commitTransaction();
      return this.findOne(id);
    } catch (error) {
      await qr.rollbackTransaction();
      handleDBErrors(error);
    } finally {
      await qr.release();
    }
  }


  private toDto(product: Product): ProductDto {
    return plainToInstance(ProductDto, {
      id: product.id,
      name: product.name,
      code: product.code,
      branchId: product.branch?.id,
      branchName: product.branch?.name,
      insuredAmount: product.insuredAmount,
      insurerId: product.insurer?.id,
      insurerName: product.insurer?.legalPerson?.organizationName,
    }, { excludeExtraneousValues: true });
  }


}
