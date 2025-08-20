import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Person } from '../../../entities/person.entity';
import { Country } from './country.entity';
import { State } from './state.entity';
import { City } from './city.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Country, { eager: true })
  country: Country;

  @ManyToOne(() => State, { eager: true })
  state: State;

  @ManyToOne(() => City, { eager: true })
  city: City;

  @Column()
  street: string;

  @Column({ nullable: true })
  streetNumber: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ nullable: true })
  apartment: string;

  @ManyToOne(() => Person, (person) => person.addresses)
  person: Person;
}
