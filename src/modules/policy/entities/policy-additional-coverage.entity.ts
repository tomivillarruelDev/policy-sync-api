import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Policy } from './policy.entity';
import { AuditableEntity } from '../../../common/entities/auditable.entity';

@Entity('policy_additional_coverages')
export class PolicyAdditionalCoverage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'coverage_name' })
    coverageName: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    percentage: number;

    @Column({ name: 'insured_value', type: 'decimal', precision: 12, scale: 2, nullable: true })
    insuredValue: number;

    // Relación con Policy
    @ManyToOne(() => Policy, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'policy_id' })
    policy: Policy;

    // Auditoría (Composición)
    @Column(() => AuditableEntity, { prefix: false })
    audit: AuditableEntity;
}
