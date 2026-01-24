import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyType } from './property-type.entity';
import { PropertyTypeService } from './property-type.service';
import { PropertyTypeController } from './property-type.controller';

@Module({
    imports: [TypeOrmModule.forFeature([PropertyType])],
    controllers: [PropertyTypeController],
    providers: [PropertyTypeService],
    exports: [PropertyTypeService],
})
export class PropertyTypeModule { }
