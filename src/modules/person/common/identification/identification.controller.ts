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
import { IdentificationService } from './services/identification.service';
import { CreateIdentificationDto } from './dto/create-identification.dto';
import { UpdateIdentificationDto } from './dto/update-identification.dto';
import { FilterIdentificationDto } from './dto/filter-identification.dto';

@Controller('identifications')
export class IdentificationController {
  constructor(private readonly identificationService: IdentificationService) {}

  @Post()
  create(@Body() dto: CreateIdentificationDto) {
    return this.identificationService.create(dto);
  }

  @Get()
  findAll(@Query() filters: FilterIdentificationDto) {
    return this.identificationService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.identificationService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateIdentificationDto,
  ) {
    return this.identificationService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.identificationService.remove(id);
  }
}
