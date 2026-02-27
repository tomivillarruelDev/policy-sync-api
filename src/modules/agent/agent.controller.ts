import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { AgentService } from './agent.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('agents')
export class AgentController {
    constructor(private readonly agentService: AgentService) { }

    @Post()
    create(@Body() createAgentDto: CreateAgentDto) {
        return this.agentService.create(createAgentDto);
    }

    @Get()
    findAll(@Query() paginationDto: PaginationDto) {
        return this.agentService.findAllPaginated(paginationDto);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.agentService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseUUIDPipe) id: string, @Body() updateAgentDto: UpdateAgentDto) {
        return this.agentService.update(id, updateAgentDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.agentService.remove(id);
    }
}
