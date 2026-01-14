import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { State } from './state.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';
import { Expose } from 'class-transformer';

@Entity()
export class City {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column()
  name: string;

  @Expose()
  @Column({ name: 'name_es', nullable: true })
  nameEs: string;

  @Expose()
  @ManyToOne(() => State, (state) => state.cities, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'state_id' })
  state: State;

  @Column(() => AuditableEntity, { prefix: false })
  audit: AuditableEntity;
}
