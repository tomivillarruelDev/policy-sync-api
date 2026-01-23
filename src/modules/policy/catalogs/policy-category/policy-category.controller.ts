import { Controller, Get } from '@nestjs/common';
import { PolicyCategoryService } from './policy-category.service';
import { PolicyCategory } from './policy-category.entity';

@Controller('policy-categories')
export class PolicyCategoryController {
    constructor(private readonly policyCategoryService: PolicyCategoryService) { }

    @Get()
    findAll(): Promise<PolicyCategory[]> {
        return this.policyCategoryService.findAll();
    }
}
