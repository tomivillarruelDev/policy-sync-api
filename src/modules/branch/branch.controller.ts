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
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('branches')
export class BranchController {
    constructor(private readonly branchService: BranchService) { }

    @Post()
    create(@Body() createBranchDto: CreateBranchDto) {
        return this.branchService.create(createBranchDto);
    }

    @Get()
    findAll(@Query() paginationDto: PaginationDto) {
        return this.branchService.findAllPaginated(paginationDto);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.branchService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateBranchDto: UpdateBranchDto,
    ) {
        return this.branchService.update(id, updateBranchDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.branchService.remove(id);
    }
}
