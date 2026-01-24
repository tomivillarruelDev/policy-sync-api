import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { VehicleType } from './vehicle-type.entity';

@Injectable()
export class VehicleTypeService extends BaseService<VehicleType> {
    constructor(
        @InjectRepository(VehicleType)
        private readonly vehicleTypeRepo: Repository<VehicleType>,
    ) {
        super(vehicleTypeRepo);
    }

    findAll(): Promise<VehicleType[]> {
        return this.vehicleTypeRepo.find();
    }
}
