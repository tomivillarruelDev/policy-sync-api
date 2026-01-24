import { Controller, Get } from '@nestjs/common';
import { VehicleTypeService } from './vehicle-type.service';
import { VehicleType } from './vehicle-type.entity';

@Controller('vehicle-types')
export class VehicleTypeController {
    constructor(private readonly vehicleTypeService: VehicleTypeService) { }

    @Get()
    findAll(): Promise<VehicleType[]> {
        return this.vehicleTypeService.findAll();
    }
}
