import { Controller, Get } from '@nestjs/common';
import { NationalityService } from './services/nationality.service';

@Controller('common/nationalities')
export class NationalityController {
    constructor(private readonly nationalityService: NationalityService) { }

    @Get()
    findAll() {
        return this.nationalityService.findAll();
    }
}
