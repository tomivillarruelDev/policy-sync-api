import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleUsage } from './vehicle-usage.entity';
import { VehicleUsageService } from './vehicle-usage.service';
import { VehicleUsageController } from './vehicle-usage.controller';

@Module({
    imports: [TypeOrmModule.forFeature([VehicleUsage])],
    controllers: [VehicleUsageController],
    providers: [VehicleUsageService],
    exports: [VehicleUsageService],
})
export class VehicleUsageModule { }
