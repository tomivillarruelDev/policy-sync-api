import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Policy } from './policy.entity';
import { RelationType } from '../enums/relation-type.enum';

import { Person } from '../../person/entities/person.entity';
import { AuditableEntity } from '../../../common/entities/auditable.entity';

@Entity('policy_dependents')
export class PolicyDependent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'relation_type', type: 'enum', enum: RelationType })
  relationType: RelationType;

  @ManyToOne(() => Person)
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @ManyToOne(() => Policy, (policy) => policy.dependents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'policy_id' })
  policy: Policy;

  @Column(() => AuditableEntity, { prefix: false })
  audit: AuditableEntity;
}
