import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PersonService } from './services/person.service';
import { RealPersonService } from './services/real-person.service';
import { LegalPersonService } from './services/legal-person.service';
import { CreateRealPersonDto } from './dto/create-real-person.dto';
import { CreateLegalPersonDto } from './dto/create-legal-person.dto';
import { Person } from './entities/person.entity';
import { RealPerson } from './entities/real-person.entity';
import { LegalPerson } from './entities/legal-person.entity';
import { UpdateRealPersonDto } from './dto/update-real-person.dto';
import { UpdateLegalPersonDto } from './dto/update-legal-person.dto';
import { mapAddressToResponseDto } from './common/mappers/address.mapper';

function flattenAddresses(entity: any) {
  if (entity?.person?.addresses) {
    entity.person.addresses = entity.person.addresses.map(mapAddressToResponseDto);
  }
  return entity;
}

@Controller('people')
export class PersonController {
  constructor(
    private readonly personService: PersonService,
    private readonly realService: RealPersonService,
    private readonly legalService: LegalPersonService,
  ) { }

  // Deshabilitado para forzar uso de subtipos
  @Post()
  create(): never {
    throw new BadRequestException(
      'Usá POST /people/real o POST /people/legal para crear',
    );
  }

  // Métodos Real (rutas específicas primero)
  @Post('real')
  async createReal(@Body() dto: CreateRealPersonDto): Promise<RealPerson> {
    const result = await this.realService.create(dto);
    return flattenAddresses(result);
  }

  @Get('real')
  async findAllReal(): Promise<RealPerson[]> {
    const results = await this.realService.findAll();
    return results.map(flattenAddresses);
  }

  @Get('real/:id')
  async findOneReal(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<RealPerson> {
    const result = await this.realService.findOne(id);
    return flattenAddresses(result);
  }

  @Patch('real/:id')
  async updateReal(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateRealPersonDto: UpdateRealPersonDto,
  ): Promise<RealPerson> {
    const result = await this.realService.update(id, updateRealPersonDto);
    return flattenAddresses(result);
  }

  @Delete('real/:id')
  async removeReal(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ deleted: boolean }> {
    await this.realService.remove(id);
    return { deleted: true };
  }

  // Métodos Legal
  @Post('legal')
  async createLegal(@Body() dto: CreateLegalPersonDto): Promise<LegalPerson> {
    const result = await this.legalService.create(dto);
    return flattenAddresses(result);
  }

  @Get('legal')
  async findAllLegal(): Promise<LegalPerson[]> {
    const results = await this.legalService.findAll();
    return results.map(flattenAddresses);
  }

  @Get('legal/:id')
  async findOneLegal(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<LegalPerson> {
    const result = await this.legalService.findOne(id);
    return flattenAddresses(result);
  }

  @Patch('legal/:id')
  async updateLegal(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateLegalPersonDto: UpdateLegalPersonDto,
  ): Promise<LegalPerson> {
    const result = await this.legalService.update(id, updateLegalPersonDto);
    return flattenAddresses(result);
  }

  @Delete('legal/:id')
  async removeLegal(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ deleted: boolean }> {
    await this.legalService.remove(id);
    return { deleted: true };
  }

  // Rutas genéricas al final para no interceptar /real o /legal
  @Get()
  findAll(): Promise<Person[]> {
    return this.personService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Person> {
    return this.personService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updatePersonDto: any,
  ): Promise<Person> {
    return this.personService.update(id, updatePersonDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ deleted: boolean }> {
    await this.personService.remove(id);
    return { deleted: true };
  }
}
