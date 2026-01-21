import { Controller, Get } from '@nestjs/common';
import { GenderService } from './services/gender.service';
import { Gender } from './entities/gender.entity';

@Controller('genders')
export class GenderController {
    constructor(private readonly genderService: GenderService) { }

    @Get()
    findAll(): Promise<Gender[]> {
        return this.genderService.findAll();
    }
}
