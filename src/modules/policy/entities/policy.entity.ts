import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { Agent } from '../../person/roles/agent/entities/agent.entity';
import { Plan } from '../../plan/entities/plan.entity';
import { PolicyDependent } from './policy-dependent.entity';
import { PolicyStatus } from '../enums/policy-status.enum';
import { BusinessType } from '../enums/business-type.enum';
import { PaymentFrequency } from '../enums/payment-frequency.enum';
import { PaymentMethod } from '../enums/payment-method.enum';

import { AuditableEntity } from '../../../common/entities/auditable.entity';

@Entity('policies')
export class Policy extends AuditableEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    policyNumber: string;

    @Column({ type: 'enum', enum: PolicyStatus, default: PolicyStatus.PENDING })
    status: PolicyStatus;

    @Column({ type: 'enum', enum: BusinessType, default: BusinessType.NEW })
    businessType: BusinessType;

    // --- Fechas ---
    @Column({ type: 'date' })
    issueDate: Date;

    @Column({ type: 'date' })
    startDate: Date;

    @Column({ type: 'date' })
    endDate: Date;

    @Column({ type: 'date', nullable: true })
    renewalDate: Date;

    // --- Financiero ---
    @Column({ type: 'decimal', precision: 12, scale: 2 })
    insuredAmount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    premiumAmount: number;

    @Column({ default: 'USD' })
    currency: string;

    @Column({ type: 'enum', enum: PaymentFrequency })
    paymentFrequency: PaymentFrequency;

    @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
    paymentMethod: PaymentMethod;

    @Column({ nullable: true })
    installments: number;

    // --- Condiciones Específicas (Overrides) ---
    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    deductibleOne: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    deductibleTwo: number;

    // --- Relaciones ---
    @ManyToOne(() => Person, { eager: true })
    client: Person;

    @ManyToOne(() => Agent, { eager: true })
    agent: Agent;

    @ManyToOne(() => Plan, { eager: true })
    plan: Plan;

    @OneToMany(() => PolicyDependent, (dependent) => dependent.policy, { cascade: true, eager: true })
    dependents: PolicyDependent[];
}
