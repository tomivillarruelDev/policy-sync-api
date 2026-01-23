import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyCategory } from './policy-category.entity';
import { PolicyCategoryService } from './policy-category.service';
import { PolicyCategoryController } from './policy-category.controller';

@Module({
    imports: [TypeOrmModule.forFeature([PolicyCategory])],
    controllers: [PolicyCategoryController],
    providers: [PolicyCategoryService],
    exports: [PolicyCategoryService],
})
export class PolicyCategoryModule { }
