import { Controller, Get, Post, Body, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { AgentService } from './agent.service';
import { CreateAgentDto } from './dto/create-agent.dto';

@Controller('agents')
export class AgentController {
    constructor(private readonly agentService: AgentService) { }

    @Post()
    create(@Body() createAgentDto: CreateAgentDto) {
        return this.agentService.create(createAgentDto);
    }

    @Get()
    findAll() {
        return this.agentService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.agentService.findOne(id);
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.agentService.remove(id);
    }
}
