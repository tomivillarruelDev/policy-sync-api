import { Controller, Get } from '@nestjs/common';
import { CivilStatusService } from './services/civil-status.service';
import { CivilStatus } from './entities/civil-status.entity';

@Controller('common/civil-status')
export class CivilStatusController {
    constructor(private readonly civilStatusService: CivilStatusService) { }

    @Get()
    findAll(): Promise<CivilStatus[]> {
        return this.civilStatusService.findAll();
    }
}
