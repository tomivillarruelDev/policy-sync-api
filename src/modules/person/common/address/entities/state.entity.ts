import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Country } from './country.entity';
import { City } from './city.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';

@Entity()
export class State {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'name_es', nullable: true })
  nameEs: string;

  @ManyToOne(() => Country, (country) => country.states, {
    onDelete: 'CASCADE',
    eager: true,
  })
  country: Country;

  @OneToMany(() => City, (city) => city.state)
  cities: City[];

  @Column(() => AuditableEntity, { prefix: false })
  audit: AuditableEntity;
}
