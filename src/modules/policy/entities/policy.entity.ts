import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { Agent } from '../../agent/entities/agent.entity';
import { Plan } from '../../plan/entities/plan.entity';
import { PolicyDependent } from './policy-dependent.entity';
import { PolicyStatus } from '../enums/policy-status.enum';
import { BusinessType } from '../enums/business-type.enum';
import { PaymentFrequency } from '../enums/payment-frequency.enum';
import { PaymentMethod } from '../enums/payment-method.enum';

import { AuditableEntity } from '../../../common/entities/auditable.entity';

@Entity('policies')
export class Policy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'policy_number', unique: true })
  policyNumber: string;

  @Column({ type: 'enum', enum: PolicyStatus, default: PolicyStatus.PENDING })
  status: PolicyStatus;

  @Column({ name: 'business_type', type: 'enum', enum: BusinessType, default: BusinessType.NEW })
  businessType: BusinessType;

  // --- Fechas ---
  @Column({ name: 'issue_date', type: 'date' })
  issueDate: Date;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'renewal_date', type: 'date', nullable: true })
  renewalDate: Date;

  // --- Financiero ---
  @Column({ name: 'insured_amount', type: 'decimal', precision: 12, scale: 2 })
  insuredAmount: number;

  @Column({ name: 'premium_amount', type: 'decimal', precision: 12, scale: 2 })
  premiumAmount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ name: 'payment_frequency', type: 'enum', enum: PaymentFrequency })
  paymentFrequency: PaymentFrequency;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod, nullable: true })
  paymentMethod: PaymentMethod;

  @Column({ nullable: true })
  installments: number;

  // --- Condiciones Específicas (Overrides) ---
  @Column({ name: 'deductible_one', type: 'decimal', precision: 12, scale: 2, nullable: true })
  deductibleOne: number;

  @Column({ name: 'deductible_two', type: 'decimal', precision: 12, scale: 2, nullable: true })
  deductibleTwo: number;

  // --- Relaciones ---
  @ManyToOne(() => Person, { eager: true })
  @JoinColumn({ name: 'client_id' })
  client: Person;

  @ManyToOne(() => Agent, { eager: true })
  @JoinColumn({ name: 'agent_id' })
  agent: Agent;

  @ManyToOne(() => Plan, { eager: true })
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  @OneToMany(() => PolicyDependent, (dependent) => dependent.policy, {
    cascade: true,
    eager: true,
  })
  dependents: PolicyDependent[];

  @Column(() => AuditableEntity, { prefix: false })
  audit: AuditableEntity;
}
