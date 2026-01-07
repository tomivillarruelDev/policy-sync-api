import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Person } from '../../../entities/person.entity';

@Entity()
export class PhoneNumber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  contactNumber: string;

  @ManyToOne(() => Person, (person) => person.phoneNumbers, {
    onDelete: 'CASCADE',
  })
  person: Person;
}
