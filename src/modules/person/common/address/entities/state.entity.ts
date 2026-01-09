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
import { Expose } from 'class-transformer';

@Entity()
export class State {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column()
  name: string;

  @Expose()
  @Column({ name: 'name_es', nullable: true })
  nameEs: string;

  @Expose()
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
