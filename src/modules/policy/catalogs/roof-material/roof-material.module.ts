import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoofMaterial } from './roof-material.entity';
import { RoofMaterialService } from './roof-material.service';
import { RoofMaterialController } from './roof-material.controller';

@Module({
    imports: [TypeOrmModule.forFeature([RoofMaterial])],
    controllers: [RoofMaterialController],
    providers: [RoofMaterialService],
    exports: [RoofMaterialService],
})
export class RoofMaterialModule { }
