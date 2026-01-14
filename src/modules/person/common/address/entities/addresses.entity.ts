import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Person } from '../../../entities/person.entity';
import { City } from './city.entity';

import { AuditableEntity } from 'src/common/entities/auditable.entity';
import { Expose } from 'class-transformer';

@Entity()
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @ManyToOne(() => City, { eager: true, onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Expose()
  @Column()
  street: string;

  @Expose()
  @Column({ name: 'street_number', nullable: true })
  streetNumber: string;

  @Expose()
  @Column({ name: 'zip_code', nullable: true })
  zipCode: string;

  @Expose()
  @Column({ nullable: true })
  apartment: string;

  @Column({ name: 'person_id', nullable: true })
  personId: string;

  @ManyToOne(() => Person, (person) => person.addresses, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column(() => AuditableEntity, { prefix: false })
  audit: AuditableEntity;
}
