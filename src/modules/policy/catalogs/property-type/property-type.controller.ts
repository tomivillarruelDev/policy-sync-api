import { Controller, Get } from '@nestjs/common';
import { PropertyTypeService } from './property-type.service';
import { PropertyType } from './property-type.entity';

@Controller('property-types')
export class PropertyTypeController {
    constructor(private readonly propertyTypeService: PropertyTypeService) { }

    @Get()
    findAll(): Promise<PropertyType[]> {
        return this.propertyTypeService.findAll();
    }
}
