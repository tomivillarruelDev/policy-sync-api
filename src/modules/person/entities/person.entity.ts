import {
  PrimaryGeneratedColumn,
  OneToMany,
  Entity,
  Column,
} from 'typeorm';
import { Identification } from '../common/identification/entity/identification.entity';
import { Address } from '../common/address/entities/addresses.entity';
import { PhoneNumber } from '../common/phone-number/entities/phone-number.entity';

import { Email } from './email.entity';
import { PersonType } from '../enums/person-type.enum';
import { AuditableEntity } from 'src/common/entities/auditable.entity';

@Entity({ name: 'people' })
export class Person {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // No se comparte never una misma Person entre subtipos.
  @Column({
    type: 'enum',
    enum: PersonType,
    nullable: false,
  })
  type: PersonType;

  // Configuration / Legal
  @Column({ default: false })
  lopdp: boolean;

  @OneToMany(() => PhoneNumber, phone => phone.person, {
    cascade: true,
    eager: true,
    orphanedRowAction: 'delete',
  })
  phoneNumbers: PhoneNumber[];

  @OneToMany(() => Email, email => email.person, {
    cascade: true,
    eager: true,
    orphanedRowAction: 'delete',
  })
  emails: Email[];

  @OneToMany(() => Address, address => address.person, {
    cascade: true,
    eager: true,
    orphanedRowAction: 'delete',
  })
  addresses: Address[];

  @OneToMany(() => Identification, identification => identification.person, {
    cascade: true,
    eager: true,
    orphanedRowAction: 'delete',
  })
  identifications: Identification[];

  @Column(() => AuditableEntity, { prefix: false })
  audit: AuditableEntity;
}