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

@Controller('people')
export class PersonController {
  constructor(
    private readonly personService: PersonService,
    private readonly realService: RealPersonService,
    private readonly legalService: LegalPersonService,
  ) {}

  // Deshabilitado para forzar uso de subtipos
  @Post()
  create(): never {
    throw new BadRequestException(
      'Usá POST /people/real o POST /people/legal para crear',
    );
  }

  // Métodos Real (rutas específicas primero)
  @Post('real')
  createReal(@Body() dto: CreateRealPersonDto): Promise<Person> {
    return this.realService.create(dto);
  }

  @Get('real')
  findAllReal(): Promise<RealPerson[]> {
    return this.realService.findAll();
  }

  @Get('real/:id')
  findOneReal(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<RealPerson> {
    return this.realService.findOne(id);
  }

  @Patch('real/:id')
  updateReal(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateRealPersonDto: UpdateRealPersonDto,
  ): Promise<RealPerson> {
    return this.realService.update(id, updateRealPersonDto);
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
  createLegal(@Body() dto: CreateLegalPersonDto): Promise<Person> {
    return this.legalService.create(dto);
  }

  @Get('legal')
  findAllLegal(): Promise<LegalPerson[]> {
    return this.legalService.findAll();
  }

  @Get('legal/:id')
  findOneLegal(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<LegalPerson> {
    return this.legalService.findOne(id);
  }

  @Patch('legal/:id')
  updateLegal(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateLegalPersonDto: UpdateLegalPersonDto,
  ): Promise<LegalPerson> {
    return this.legalService.update(id, updateLegalPersonDto);
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
