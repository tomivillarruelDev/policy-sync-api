import { Expose } from 'class-transformer';
import { BusinessType } from '../enums/business-type.enum';

export class PolicyDto {
    @Expose()
    id: string;

    // --- Header ---
    @Expose()
    policyNumber: string;

    @Expose()
    businessType: BusinessType;

    // --- Flat Catalog IDs (Strict ID Pattern) ---
    @Expose()
    policyStatusId: string;

    @Expose()
    policyStatusName: string;

    @Expose()
    policyStatusNameEs: string;

    @Expose()
    policyCategoryId: string;

    @Expose()
    policyCategoryName: string;

    // --- Flat Actor IDs ---
    @Expose()
    clientId: string;

    @Expose()
    agentId: string;

    @Expose()
    insurerId: string;

    @Expose()
    planId: string;

    @Expose()
    branchId: string;

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

    // --- Child Arrays (plain objects, mapeados en toDto) ---
    @Expose()
    insuredVehicles: any[];

    @Expose()
    insuredProperties: any[];

    @Expose()
    dependents: any[];

    @Expose()
    beneficiaries: any[];

    @Expose()
    additionalCoverages: any[];

    @Expose()
    installments: any[];

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
