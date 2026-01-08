import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { State } from './state.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';

@Entity()
export class City {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'name_es', nullable: true })
  nameEs: string;

  @ManyToOne(() => State, (state) => state.cities, {
    onDelete: 'CASCADE',
    eager: true,
  })
  state: State;

  @Column(() => AuditableEntity, { prefix: false })
  audit: AuditableEntity;
}
