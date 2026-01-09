import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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
  city: City;

  @Expose()
  @Column()
  street: string;

  @Expose()
  @Column({ nullable: true })
  streetNumber: string;

  @Expose()
  @Column({ nullable: true })
  zipCode: string;

  @Expose()
  @Column({ nullable: true })
  apartment: string;

  @ManyToOne(() => Person, (person) => person.addresses, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  person: Person;

  @Column(() => AuditableEntity, { prefix: false })
  audit: AuditableEntity;
}
