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
export class RealPerson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'middle_name', nullable: true, type: 'varchar' })
  middleName: string | null;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'maternal_last_name', nullable: true, type: 'varchar' })
  maternalLastName: string | null;

  @Column({ nullable: true, type: 'varchar' })
  nationality: string | null;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: Date | null;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender | null;

  @Column({ name: 'civil_status', type: 'enum', enum: CivilStatus, nullable: true })
  civilStatus: CivilStatus | null;

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
