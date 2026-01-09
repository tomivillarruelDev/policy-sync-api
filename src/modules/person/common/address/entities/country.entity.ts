import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { State } from './state.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';
import { Expose } from 'class-transformer';

@Entity()
export class Country {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column()
  name: string;

  @Expose()
  @Column({ name: 'name_es', nullable: true })
  nameEs: string;

  @Expose()
  @Column({ nullable: true })
  code: string;

  @Expose()
  @Column({ nullable: true })
  flag: string;

  @OneToMany(() => State, (state) => state.country)
  states: State[];

  @Column(() => AuditableEntity, { prefix: false })
  audit: AuditableEntity;
}
