import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Insurer } from '../../insurer/entities/insurer.entity';
import { Plan } from '../../plan/entities/plan.entity';
import { Branch } from '../../branch/entities/branch.entity';

import { AuditableEntity } from '../../../common/entities/auditable.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @ManyToOne(() => Branch, { eager: true })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  // Valores Económicos
  @Column({ name: 'insured_amount', type: 'decimal', precision: 12, scale: 2 })
  insuredAmount: number;

  @ManyToOne(() => Insurer, (insurer) => insurer.products)
  @JoinColumn({ name: 'insurer_id' })
  insurer: Insurer;

  @OneToMany(() => Plan, (plan) => plan.product)
  plans: Plan[];

  @Column(() => AuditableEntity, { prefix: false })
  audit: AuditableEntity;
}
