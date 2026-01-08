import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Person } from '../../../entities/person.entity';
import { IdentificationType } from './identification-type.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';

@Entity()
@Unique('UQ_ident_type_value', ['type', 'value'])
export class Identification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  value: string;

  @ManyToOne(() => IdentificationType, (type) => type.identifications, {
    eager: true,
  })
  type: IdentificationType;

  @ManyToOne(() => Person, (person) => person.identifications, {
    onDelete: 'CASCADE',
  })
  person: Person;

  @Column(() => AuditableEntity, { prefix: false })
  audit: AuditableEntity;
}
