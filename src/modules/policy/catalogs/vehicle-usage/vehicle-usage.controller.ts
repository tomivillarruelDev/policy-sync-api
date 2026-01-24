import { Controller, Get } from '@nestjs/common';
import { VehicleUsageService } from './vehicle-usage.service';
import { VehicleUsage } from './vehicle-usage.entity';

@Controller('vehicle-usages')
export class VehicleUsageController {
    constructor(private readonly vehicleUsageService: VehicleUsageService) { }

    @Get()
    findAll(): Promise<VehicleUsage[]> {
        return this.vehicleUsageService.findAll();
    }
}
