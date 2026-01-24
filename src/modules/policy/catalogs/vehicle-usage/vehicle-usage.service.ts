import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { VehicleUsage } from './vehicle-usage.entity';

@Injectable()
export class VehicleUsageService extends BaseService<VehicleUsage> {
    constructor(
        @InjectRepository(VehicleUsage)
        private readonly vehicleUsageRepo: Repository<VehicleUsage>,
    ) {
        super(vehicleUsageRepo);
    }

    findAll(): Promise<VehicleUsage[]> {
        return this.vehicleUsageRepo.find();
    }
}
