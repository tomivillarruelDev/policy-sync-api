import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyStatus } from './policy-status.entity';
import { PolicyStatusService } from './policy-status.service';
import { PolicyStatusController } from './policy-status.controller';

@Module({
    imports: [TypeOrmModule.forFeature([PolicyStatus])],
    controllers: [PolicyStatusController],
    providers: [PolicyStatusService],
    exports: [PolicyStatusService],
})
export class PolicyStatusModule { }
