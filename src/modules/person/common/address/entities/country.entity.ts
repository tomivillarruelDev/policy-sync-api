import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { State } from './state.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';

@Entity()
export class Country extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'name_es', nullable: true })
  nameEs: string;

  @Column({ nullable: true })
  code: string;

  @Column({ nullable: true })
  flag: string;

  @OneToMany(() => State, (state) => state.country)
  states: State[];
}
