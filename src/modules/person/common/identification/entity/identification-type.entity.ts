import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Identification } from './identification.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';
import { Expose } from 'class-transformer';

@Entity()
export class IdentificationType {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column()
  name: string;

  @Expose()
  @Column({ name: 'name_es', nullable: true })
  nameEs: string;

  @OneToMany(() => Identification, (identification) => identification.type)
  identifications: Identification[];

  @Column(() => AuditableEntity, { prefix: false })
  audit: AuditableEntity;
}
