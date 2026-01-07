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
export class LegalPerson extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Person, { onDelete: 'CASCADE', cascade: ['insert', 'update'], eager: true })
  @JoinColumn({ name: 'personId' })
  person: Person;

  @Column()
  organizationName: string;

  @Column({ nullable: true })
  socialReason?: string;

  @Column({ nullable: true })
  website?: string;
}
