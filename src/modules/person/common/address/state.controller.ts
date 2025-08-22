import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { StateService } from './services/state.service';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { CityService } from './services/city.service';

@Controller('states')
export class StateController {
  constructor(
    private readonly service: StateService,
    private readonly cityService: CityService,
  ) {}

  @Post()
  create(@Body() dto: CreateStateDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('countryId') countryId?: string) {
    return this.service.findAll(countryId);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(id);
  }

  // Nested: /states/:id/cities
  @Get(':id/cities')
  findCities(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cityService.findAll(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateStateDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.remove(id);
  }
}
