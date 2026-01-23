import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelationType } from './relation-type.entity';
import { RelationTypeService } from './relation-type.service';
import { RelationTypeController } from './relation-type.controller';

@Module({
    imports: [TypeOrmModule.forFeature([RelationType])],
    controllers: [RelationTypeController],
    providers: [RelationTypeService],
    exports: [RelationTypeService],
})
export class RelationTypeModule { }
