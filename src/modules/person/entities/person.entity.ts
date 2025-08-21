import {
  PrimaryGeneratedColumn,
  OneToMany,
  TableInheritance,
  Entity,
} from 'typeorm';
import { Identification } from '../common/identification/entity/identification.entity';
import { Address } from '../common/address/entities/addresses.entity';
import { PhoneNumber } from '../common/phone-number/entities/phone-number.entity';

import { Email } from './email.entity';

@Entity({ name: 'people' })
export class Person {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => PhoneNumber, phone => phone.person, { cascade: true })
  phoneNumbers: PhoneNumber[];

  @OneToMany(() => Email, email => email.person, { cascade: true })
  emails: Email[];

  @OneToMany(() => Address, address => address.person, { cascade: true })
  addresses: Address[];

  @OneToMany(() => Identification, identification => identification.person, { cascade: true })
  identifications: Identification[];
}