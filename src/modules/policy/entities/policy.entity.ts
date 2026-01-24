import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { Client } from '../../clients/entities/client.entity';
import { Agent } from '../../agent/entities/agent.entity';
import { Insurer } from '../../insurer/entities/insurer.entity';
import { Plan } from '../../plan/entities/plan.entity';
import { PolicyStatus } from '../catalogs/policy-status/policy-status.entity';
import { PolicyCategory } from '../catalogs/policy-category/policy-category.entity';
import { PolicyInsuredVehicle } from './policy-insured-vehicle.entity';
import { PolicyInsuredProperty } from './policy-insured-property.entity';
import { PolicyDependent } from './policy-dependent.entity';
import { PolicyBeneficiary } from './policy-beneficiary.entity';
import { PolicyAdditionalCoverage } from './policy-additional-coverage.entity';
import { PolicyInstallment } from './policy-installment.entity';
import { BusinessType } from '../enums/business-type.enum';

@Entity('policies')
export class Policy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --- Header (Captura 1 y 2) ---
  @Column({ name: 'policy_number', unique: true })
  policyNumber: string;

  @Column({ name: 'business_type', type: 'enum', enum: BusinessType, default: BusinessType.NEW_BUSINESS })
  businessType: BusinessType;

  @ManyToOne(() => PolicyStatus, { eager: true })
  @JoinColumn({ name: 'policy_status_id' })
  policyStatus: PolicyStatus;

  @ManyToOne(() => PolicyCategory, { eager: true })
  @JoinColumn({ name: 'policy_category_id' })
  policyCategory: PolicyCategory;

  // --- Actores ---
  @ManyToOne(() => Client, { eager: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => Agent, { eager: true })
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @ManyToOne(() => Insurer, { eager: true })
  @JoinColumn({ name: 'insurer_id' })
  insurer: Insurer;

  @ManyToOne(() => Plan, { eager: true })
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  // --- Fechas (Captura 2) ---
  @Column({ name: 'issued_date', type: 'date', nullable: true })
  issuedDate: Date;

  @Column({ name: 'validity_start', type: 'date' })
  validityStart: Date;

  @Column({ name: 'validity_end', type: 'date' })
  validityEnd: Date;

  @Column({ name: 'renewal_date', type: 'date', nullable: true })
  renewalDate: Date;

  @Column({ name: 'billing_date', type: 'date', nullable: true })
  billingDate: Date;

  // --- Prima / Financials (Captura 4 - Flattened) ---
  @Column({ default: 'USD', length: 3 })
  currency: string;

  @Column({ name: 'sum_insured', type: 'decimal', precision: 15, scale: 2, nullable: true })
  sumInsured: number;

  @Column({ name: 'net_premium', type: 'decimal', precision: 12, scale: 2 })
  netPremium: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'total_premium', type: 'decimal', precision: 12, scale: 2 })
  totalPremium: number;

  @Column({ name: 'commission_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  commissionPercentage: number;

  @Column({ name: 'payment_frequency', nullable: true })
  paymentFrequency: string;

  @Column({ name: 'payment_method', nullable: true })
  paymentMethod: string;

  @Column({ name: 'number_of_installments', type: 'int', default: 1 })
  numberOfInstallments: number;

  // --- Self-Relation (Renovaciones) ---
  @ManyToOne(() => Policy, { nullable: true })
  @JoinColumn({ name: 'previous_policy_id' })
  previousPolicy: Policy;

  // --- Relaciones Hijas (OneToMany) ---
  @OneToMany(() => PolicyInsuredVehicle, (vehicle) => vehicle.policy, { cascade: true })
  insuredVehicles: PolicyInsuredVehicle[];

  @OneToMany(() => PolicyInsuredProperty, (property) => property.policy, { cascade: true })
  insuredProperties: PolicyInsuredProperty[];

  @OneToMany(() => PolicyDependent, (dependent) => dependent.policy, { cascade: true })
  dependents: PolicyDependent[];

  @OneToMany(() => PolicyBeneficiary, (beneficiary) => beneficiary.policy, { cascade: true })
  beneficiaries: PolicyBeneficiary[];

  @OneToMany(() => PolicyAdditionalCoverage, (coverage) => coverage.policy, { cascade: true })
  additionalCoverages: PolicyAdditionalCoverage[];

  @OneToMany(() => PolicyInstallment, (installment: PolicyInstallment) => installment.policy, { cascade: true })
  installments: PolicyInstallment[];

  // --- Auditoría (Composición) ---
  @Column(() => AuditableEntity, { prefix: false })
  audit: AuditableEntity;
}
