import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { LegalPerson } from '../../../entities/legal-person.entity';

@Entity({ name: 'businesses' })
@Unique('UQ_business_legal_person', ['legalPerson'])
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Cada Business representa una persona jurídica
  @OneToOne(() => LegalPerson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'legalPersonId' })
  legalPerson: LegalPerson;
}
