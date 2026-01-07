import { LegalPerson } from 'src/modules/person/entities/legal-person.entity';
import { RealPerson } from 'src/modules/person/entities/real-person.entity';
import {
  Entity,
  JoinColumn,
  OneToOne,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditableEntity } from 'src/common/entities/auditable.entity';

@Entity({ name: 'contacts' })
export class Contact extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => RealPerson, { cascade: ['insert', 'remove'], eager: true })
  @JoinColumn({ name: 'real_person_id' })
  realPerson: RealPerson;

  @ManyToOne(() => LegalPerson, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
    cascade: ['insert'],
  })
  @JoinColumn({ name: 'legal_person_id' })
  legalPerson?: LegalPerson;
}
