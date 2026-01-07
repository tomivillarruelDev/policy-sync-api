import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Person } from './person.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';

@Entity({ name: 'real_people' })
export class RealPerson extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Person, { onDelete: 'CASCADE', cascade: ['insert', 'update'], eager: true })
  @JoinColumn({ name: 'personId' })
  person: Person;

  @Column()
  firstName: string;

  @Column()
  lastName: string;
}
