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
import { Expose } from 'class-transformer';

@Entity()
@Unique('UQ_ident_type_value', ['type', 'value'])
export class Identification {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column()
  value: string;

  @Expose()
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
