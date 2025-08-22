import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CountryService } from './services/country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { StateService } from './services/state.service';

@Controller('countries')
export class CountryController {
  constructor(
    private readonly service: CountryService,
    private readonly stateService: StateService,
  ) {}

  @Post()
  create(@Body() dto: CreateCountryDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(id);
  }

  // Nested: /countries/:id/states
  @Get(':id/states')
  findStates(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.stateService.findAll(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCountryDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.remove(id);
  }
}
