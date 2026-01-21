import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { Person } from './person.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';
import { Gender } from './gender.entity';
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

  @ManyToOne(() => Gender, { eager: true })
  @JoinColumn({ name: 'gender_id' })
  gender: Gender | null;

  @Column({ name: 'gender_id' })
  genderId: string;

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
