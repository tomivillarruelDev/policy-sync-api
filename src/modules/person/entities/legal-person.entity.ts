import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Person } from './person.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';

@Entity({ name: 'legal_people' })
export class LegalPerson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_name' })
  organizationName: string;

  @Column({ name: 'social_reason', nullable: true })
  socialReason?: string;

  @Column({ nullable: true })
  website?: string;

  @OneToOne(() => Person, {
    onDelete: 'CASCADE',
    cascade: ['insert', 'update'],
    eager: true,
  })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column(() => AuditableEntity, { prefix: false })
  audit: AuditableEntity;
}
