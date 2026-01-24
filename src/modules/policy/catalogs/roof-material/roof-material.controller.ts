import { Controller, Get } from '@nestjs/common';
import { RoofMaterialService } from './roof-material.service';
import { RoofMaterial } from './roof-material.entity';

@Controller('roof-materials')
export class RoofMaterialController {
    constructor(private readonly roofMaterialService: RoofMaterialService) { }

    @Get()
    findAll(): Promise<RoofMaterial[]> {
        return this.roofMaterialService.findAll();
    }
}
