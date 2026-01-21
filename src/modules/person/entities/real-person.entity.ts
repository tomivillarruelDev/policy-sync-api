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
import { CivilStatus } from './civil-status.entity';

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

  @ManyToOne(() => Gender)
  @JoinColumn({ name: 'gender_id' })
  gender: Gender;

  @Column({ name: 'gender_id' })
  genderId: string;

  @ManyToOne(() => CivilStatus)
  @JoinColumn({ name: 'civil_status_id' })
  civilStatus: CivilStatus;

  @Column({ name: 'civil_status_id', nullable: true })
  civilStatusId: string;

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
