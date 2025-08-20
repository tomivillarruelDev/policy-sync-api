import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Person } from '../../../entities/person.entity';
import { IdentificationType } from './identification-type.entity';

@Entity()
@Unique('UQ_ident_person_type_number', ['person', 'type', 'number'])
export class Identification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  number: string;

  @ManyToOne(() => IdentificationType, (type) => type.identifications, {
    eager: true,
  })
  type: IdentificationType;

  @ManyToOne(() => Person, (person) => person.identifications, {
    onDelete: 'CASCADE',
  })
  person: Person;
}
