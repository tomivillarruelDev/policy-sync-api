import { Module } from '@nestjs/common';
import { InsurerService } from './insurer.service';
import { InsurerController } from './insurer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Insurer } from './entities/insurer.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Insurer])],
    controllers: [InsurerController],
    providers: [InsurerService],
    exports: [InsurerService],
})
export class InsurerModule { }
