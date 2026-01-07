import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PolicyStatus } from '../enums/policy-status.enum';
import { BusinessType } from '../enums/business-type.enum';
import { PaymentFrequency } from '../enums/payment-frequency.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { CreatePolicyDependentDto } from './create-policy-dependent.dto'; // Need to create this too

export class CreatePolicyDto {
    @IsString()
    policyNumber: string;

    @IsEnum(PolicyStatus)
    @IsOptional()
    status: PolicyStatus;

    @IsEnum(BusinessType)
    @IsOptional()
    businessType: BusinessType;

    @IsDateString()
    issueDate: Date;

    @IsDateString()
    startDate: Date;

    @IsDateString()
    endDate: Date;

    @IsNumber()
    insuredAmount: number;

    @IsNumber()
    premiumAmount: number;

    @IsString()
    @IsOptional()
    currency: string;

    @IsEnum(PaymentFrequency)
    paymentFrequency: PaymentFrequency;

    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @IsNumber()
    @IsOptional()
    installments: number;

    // IDs for relationships
    @IsUUID()
    clientId: string;

    @IsUUID()
    agentId: string;

    @IsUUID()
    planId: string;

    // Dependents
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreatePolicyDependentDto)
    dependents: CreatePolicyDependentDto[];
}
