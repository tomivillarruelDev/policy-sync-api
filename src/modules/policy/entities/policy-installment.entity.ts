import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Policy } from './policy.entity';
import { AuditableEntity } from '../../../common/entities/auditable.entity';

@Entity('policy_installments')
export class PolicyInstallment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'installment_number', type: 'int' })
    installmentNumber: number;

    @Column({ name: 'due_date', type: 'date' })
    dueDate: Date;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount: number;

    @Column({ default: 'PENDING' })
    status: string;

    @Column({ name: 'payment_date', type: 'date', nullable: true })
    paymentDate: Date;

    // Relación con Policy
    @ManyToOne(() => Policy, (policy) => policy.installments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'policy_id' })
    policy: Policy;

    // Auditoría (Composición)
    @Column(() => AuditableEntity, { prefix: false })
    audit: AuditableEntity;
}
