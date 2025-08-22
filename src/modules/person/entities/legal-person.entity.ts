import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Person } from './person.entity';

@Entity({ name: 'legal_people' })
export class LegalPerson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Person, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'personId' })
  person: Person;

  @Column()
  organizationName: string;

  @Column({ nullable: true })
  website?: string;
}
