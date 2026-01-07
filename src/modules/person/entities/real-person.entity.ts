import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Person } from './person.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';
import { Gender } from '../enums/gender.enum';
import { CivilStatus } from '../enums/civil-status.enum';

@Entity({ name: 'real_people' })
export class RealPerson extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Person, { onDelete: 'CASCADE', cascade: ['insert', 'update'], eager: true })
  @JoinColumn({ name: 'personId' })
  person: Person;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  maternalLastName: string;

  @Column({ nullable: true })
  nationality: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ type: 'enum', enum: CivilStatus, nullable: true })
  civilStatus: CivilStatus;
}
