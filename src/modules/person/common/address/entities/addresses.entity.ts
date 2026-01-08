import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Person } from '../../../entities/person.entity';
import { City } from './city.entity';

import { AuditableEntity } from 'src/common/entities/auditable.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => City, { eager: true, onDelete: 'CASCADE', nullable: false })
  city: City;

  @Column()
  street: string;

  @Column({ nullable: true })
  streetNumber: string;

  @Column({ nullable: true })
  zipCode: string;

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
