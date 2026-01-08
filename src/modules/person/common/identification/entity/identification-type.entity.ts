import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Identification } from './identification.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';

@Entity()
export class IdentificationType extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  nameEs: string;

  @OneToMany(() => Identification, (identification) => identification.type)
  identifications: Identification[];
}
