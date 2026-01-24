import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { PropertyType } from './property-type.entity';

@Injectable()
export class PropertyTypeService extends BaseService<PropertyType> {
    constructor(
        @InjectRepository(PropertyType)
        private readonly propertyTypeRepo: Repository<PropertyType>,
    ) {
        super(propertyTypeRepo);
    }

    findAll(): Promise<PropertyType[]> {
        return this.propertyTypeRepo.find();
    }
}
