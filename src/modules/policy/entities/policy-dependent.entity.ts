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

@Entity('policy_dependents')
export class PolicyDependent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  deductible: number;

  @Column({ default: true })
  status: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relación con Policy
  @ManyToOne(() => Policy, (policy) => policy.dependents, { onDelete: 'CASCADE' })
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
