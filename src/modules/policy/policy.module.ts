import { Module } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { PolicyController } from './policy.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Policy } from './entities/policy.entity';
import { PolicyDependent } from './entities/policy-dependent.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Policy, PolicyDependent])],
    controllers: [PolicyController],
    providers: [PolicyService],
    exports: [PolicyService],
})
export class PolicyModule { }
