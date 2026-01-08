import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Person } from '../../../entities/person.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';

@Entity()
export class PhoneNumber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  number: string;

  @ManyToOne(() => Person, (person) => person.phoneNumbers, {
    onDelete: 'CASCADE',
  })
  person: Person;

  @Column(() => AuditableEntity, { prefix: false })
  audit: AuditableEntity;
}
