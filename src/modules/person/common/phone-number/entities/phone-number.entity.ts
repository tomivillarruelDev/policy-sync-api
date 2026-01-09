import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Person } from '../../../entities/person.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';
import { Expose } from 'class-transformer';

@Entity()
export class PhoneNumber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column()
  number: string;

  @ManyToOne(() => Person, (person) => person.phoneNumbers, {
    onDelete: 'CASCADE',
  })
  person: Person;

  @Column(() => AuditableEntity, { prefix: false })
  audit: AuditableEntity;
}
