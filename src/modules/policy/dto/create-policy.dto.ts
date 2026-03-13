import { IsNotEmpty, IsString, IsNumber, IsOptional, IsUUID, IsEnum, IsArray, ValidateNested, IsDateString, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { BusinessType } from '../enums/business-type.enum';

export class CreatePolicyInstallmentDto {
  @IsNumber()
  @Min(1)
  installmentNumber: number;

  @IsDateString()
  dueDate: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;
}

export class CreatePolicyVehicleDto {
  @IsOptional()
  @IsUUID()
  usageTypeId?: string;

  @IsOptional()
  @IsUUID()
  vehicleTypeId?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  vehicleVersion?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  plate?: string;

  @IsOptional()
  @IsString()
  chassis?: string;

  @IsOptional()
  @IsString()
  engine?: string;

  @IsOptional()
  @IsNumber()
  insuredValue?: number;

  @IsOptional()
  @IsUUID()
  countryId?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class CreatePolicyPropertyDto {
  @IsUUID()
  cityId: string;

  @IsString()
  street: string;

  @IsOptional()
  @IsString()
  streetNumber?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  apartment?: string;

  @IsOptional()
  @IsString()
  floor?: string;

  @IsOptional()
  @IsBoolean()
  isPermanentResidence?: boolean;

  @IsOptional()
  @IsUUID()
  propertyTypeId?: string;

  @IsOptional()
  @IsUUID()
  roofMaterialId?: string;

  @IsOptional()
  @IsNumber()
  totalSquareMeters?: number;

  @IsOptional()
  @IsNumber()
  builtSquareMeters?: number;

  @IsOptional()
  @IsBoolean()
  hasAlarm?: boolean;

  @IsOptional()
  @IsBoolean()
  hasReinforcedDoor?: boolean;

  @IsOptional()
  @IsBoolean()
  windowBars?: boolean;

  @IsOptional()
  @IsNumber()
  buildingFireSum?: number;

  @IsOptional()
  @IsNumber()
  contentFireSum?: number;

  @IsOptional()
  @IsNumber()
  theftSum?: number;
}

export class CreatePolicyDependentDto {
  @IsUUID()
  realPersonId: string;

  @IsUUID()
  relationTypeId: string;

  @IsOptional()
  @IsNumber()
  deductible?: number;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePolicyBeneficiaryDto {
  @IsUUID()
  realPersonId: string;

  @IsUUID()
  relationTypeId: string;

  @IsNumber()
  @Min(0)
  percentage: number;
}

export class CreatePolicyAdditionalCoverageDto {
  @IsString()
  coverageName: string;

  @IsOptional()
  @IsNumber()
  percentage?: number;

  @IsOptional()
  @IsNumber()
  insuredValue?: number;
}

export class CreatePolicyDto {
  // --- Header ---
  @IsString()
  @IsNotEmpty()
  policyNumber: string;

  @IsEnum(BusinessType)
  @IsOptional()
  businessType?: BusinessType;

  @IsUUID()
  policyStatusId: string;

  @IsUUID()
  policyCategoryId: string;

  // --- Actores ---
  @IsUUID()
  clientId: string;

  @IsUUID()
  agentId: string;

  @IsUUID()
  insurerId: string;

  @IsUUID()
  planId: string;

  // --- Fechas ---
  @IsOptional()
  @IsDateString()
  issuedDate?: string;

  @IsDateString()
  validityStart: string;

  @IsDateString()
  validityEnd: string;

  @IsOptional()
  @IsDateString()
  renewalDate?: string;

  @IsOptional()
  @IsDateString()
  billingDate?: string;

  // --- Financials ---
  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  sumInsured?: number;

  @IsNumber()
  @Min(0)
  netPremium: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @IsNumber()
  @Min(0)
  totalPremium: number;

  @IsOptional()
  @IsNumber()
  commissionPercentage?: number;

  @IsOptional()
  @IsString()
  paymentFrequency?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsNumber()
  numberOfInstallments?: number;

  // --- Previous Policy (Renewal) ---
  @IsOptional()
  @IsUUID()
  previousPolicyId?: string;

  // --- Nested Arrays (Opcionales) ---
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePolicyVehicleDto)
  vehicles?: CreatePolicyVehicleDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePolicyPropertyDto)
  properties?: CreatePolicyPropertyDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePolicyDependentDto)
  dependents?: CreatePolicyDependentDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePolicyBeneficiaryDto)
  beneficiaries?: CreatePolicyBeneficiaryDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePolicyAdditionalCoverageDto)
  additionalCoverages?: CreatePolicyAdditionalCoverageDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePolicyInstallmentDto)
  installments?: CreatePolicyInstallmentDto[];
}
