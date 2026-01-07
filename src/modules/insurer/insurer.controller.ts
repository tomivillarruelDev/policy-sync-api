import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { InsurerService } from './insurer.service';
import { CreateInsurerDto } from './dto/create-insurer.dto';
import { UpdateInsurerDto } from './dto/update-insurer.dto';

@Controller('insurer')
export class InsurerController {
    constructor(private readonly insurerService: InsurerService) { }

    @Post()
    create(@Body() createInsurerDto: CreateInsurerDto) {
        return this.insurerService.create(createInsurerDto);
    }

    @Get()
    findAll() {
        return this.insurerService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.insurerService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseUUIDPipe) id: string, @Body() updateInsurerDto: UpdateInsurerDto) {
        return this.insurerService.update(id, updateInsurerDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.insurerService.remove(id);
    }
}
