import { Expose, Type } from 'class-transformer';
import { PolicyStatus } from '../catalogs/policy-status/policy-status.entity';
import { PolicyCategory } from '../catalogs/policy-category/policy-category.entity';
import { PolicyInsuredVehicle } from '../entities/policy-insured-vehicle.entity';
import { PolicyInsuredProperty } from '../entities/policy-insured-property.entity';
import { PolicyDependent } from '../entities/policy-dependent.entity';
import { PolicyBeneficiary } from '../entities/policy-beneficiary.entity';
import { PolicyAdditionalCoverage } from '../entities/policy-additional-coverage.entity';
import { PolicyInstallment } from '../entities/policy-installment.entity';
import { BusinessType } from '../enums/business-type.enum';
import { Insurer } from '../../insurer/entities/insurer.entity';
import { Plan } from '../../plan/entities/plan.entity';

export class PolicyDto {
    @Expose()
    id: string;

    // --- Header ---
    @Expose()
    policyNumber: string;

    @Expose()
    businessType: BusinessType;

    // --- Catalog Relations (Full Objects) ---
    @Expose()
    @Type(() => PolicyStatus)
    policyStatus: PolicyStatus;

    @Expose()
    @Type(() => PolicyCategory)
    policyCategory: PolicyCategory;

    // --- Flat IDs for catalogs ---
    @Expose()
    policyStatusId: string;

    @Expose()
    policyCategoryId: string;

    // --- Actors (Flat IDs) ---
    @Expose()
    clientId: string;

    @Expose()
    agentId: string;

    @Expose()
    insurerId: string;

    @Expose()
    planId: string;

    @Expose()
    @Type(() => Insurer)
    insurer: Insurer;

    @Expose()
    @Type(() => Plan)
    plan: Plan;

    @Expose()
    previousPolicyId: string;

    // --- Fechas ---
    @Expose()
    issuedDate: Date;

    @Expose()
    validityStart: Date;

    @Expose()
    validityEnd: Date;

    @Expose()
    renewalDate: Date;

    @Expose()
    billingDate: Date;

    // --- Financials ---
    @Expose()
    currency: string;

    @Expose()
    sumInsured: number;

    @Expose()
    netPremium: number;

    @Expose()
    taxAmount: number;

    @Expose()
    totalPremium: number;

    @Expose()
    commissionPercentage: number;

    @Expose()
    paymentFrequency: string;

    @Expose()
    paymentMethod: string;

    @Expose()
    numberOfInstallments: number;

    // --- Child Arrays (with @Type decorators) ---
    @Expose()
    @Type(() => PolicyInsuredVehicle)
    insuredVehicles: PolicyInsuredVehicle[];

    @Expose()
    @Type(() => PolicyInsuredProperty)
    insuredProperties: PolicyInsuredProperty[];

    @Expose()
    @Type(() => PolicyDependent)
    dependents: PolicyDependent[];

    @Expose()
    @Type(() => PolicyBeneficiary)
    beneficiaries: PolicyBeneficiary[];

    @Expose()
    @Type(() => PolicyAdditionalCoverage)
    additionalCoverages: PolicyAdditionalCoverage[];

    @Expose()
    @Type(() => PolicyInstallment)
    installments: PolicyInstallment[];

    // --- Flattened Client Info (for display) ---
    @Expose()
    clientName: string; // client.realPerson.firstName + lastName

    @Expose()
    agentName: string; // agent.realPerson.firstName + lastName

    @Expose()
    insurerName: string;

    @Expose()
    planName: string;
}
