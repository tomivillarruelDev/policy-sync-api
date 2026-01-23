import { Controller, Get } from '@nestjs/common';
import { RelationTypeService } from './relation-type.service';
import { RelationType } from './relation-type.entity';

@Controller('relation-types')
export class RelationTypeController {
    constructor(private readonly relationTypeService: RelationTypeService) { }

    @Get()
    findAll(): Promise<RelationType[]> {
        return this.relationTypeService.findAll();
    }
}
