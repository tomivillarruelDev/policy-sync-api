import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { PersonService } from './services/person.service';
import { RealPersonService } from './services/real-person.service';
import { LegalPersonService } from './services/legal-person.service';
import { CreateRealPersonDto } from './dto/create-real-person.dto';
import { CreateLegalPersonDto } from './dto/create-legal-person.dto';
import { Person } from './entities/person.entity';
import { RealPerson } from './entities/real-person.entity';
import { LegalPerson } from './entities/legal-person.entity';

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

  // Crear subtipos
  @Post('real')
  createReal(@Body() dto: CreateRealPersonDto): Promise<Person> {
    return this.realService.create(dto);
  }

  @Post('legal')
  createLegal(@Body() dto: CreateLegalPersonDto): Promise<Person> {
    return this.legalService.create(dto);
  }

  @Get()
  findAll(): Promise<Person[]> {
    return this.personService.findAll();
  }

  // Subtipos: GETs primero para no chocar con :id
  @Get('real')
  findAllReal(): Promise<RealPerson[]> {
    return this.realService.findAll();
  }

  @Get('real/:id')
  findOneReal(@Param('id') id: string): Promise<RealPerson> {
    return this.realService.findOne(id);
  }

  @Get('legal')
  findAllLegal(): Promise<LegalPerson[]> {
    return this.legalService.findAll();
  }

  @Get('legal/:id')
  findOneLegal(@Param('id') id: string): Promise<LegalPerson> {
    return this.legalService.findOne(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Person> {
    return this.personService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePersonDto: any,
  ): Promise<Person> {
    return this.personService.update(id, updatePersonDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    await this.personService.remove(id);
    return { deleted: true };
  }
}
