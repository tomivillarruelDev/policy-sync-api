import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Policy } from './policy.entity';
import { RealPerson } from '../../person/entities/real-person.entity';
import { RelationType } from '../catalogs/relation-type/relation-type.entity';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { Expose } from 'class-transformer';

@Entity('policy_beneficiaries')
export class PolicyBeneficiary {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    percentage: number;

    // Relación con Policy
    @ManyToOne(() => Policy, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'policy_id' })
    policy: Policy;

    // Relación con RealPerson
    @Expose()
    @ManyToOne(() => RealPerson, { eager: true })
    @JoinColumn({ name: 'real_person_id' })
    realPerson: RealPerson;

    // Relación con RelationType
    @Expose()
    @ManyToOne(() => RelationType, { eager: true })
    @JoinColumn({ name: 'relation_type_id' })
    relationType: RelationType;

    // Auditoría (Composición)
    @Column(() => AuditableEntity, { prefix: false })
    audit: AuditableEntity;
}
