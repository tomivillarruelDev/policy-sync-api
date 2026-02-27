import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientDto } from './dto/client.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('clients')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Post()
    create(@Body() createClientDto: CreateClientDto): Promise<ClientDto> {
        return this.clientsService.create(createClientDto);
    }

    @Get()
    findAll(@Query() paginationDto: PaginationDto) {
        return this.clientsService.findAllPaginated(paginationDto);
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<ClientDto> {
        return this.clientsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto): Promise<ClientDto> {
        return this.clientsService.update(id, updateClientDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.clientsService.remove(id);
    }
}
