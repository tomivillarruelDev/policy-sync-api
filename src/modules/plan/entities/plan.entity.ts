import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../product/entities/product.entity';

import { AuditableEntity } from '../../../common/entities/auditable.entity';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ name: 'deductible_one', type: 'decimal', precision: 12, scale: 2, default: 0 })
  deductibleOne: number;

  @Column({ name: 'deductible_two', type: 'decimal', precision: 12, scale: 2, default: 0 })
  deductibleTwo: number;

  @ManyToOne(() => Product, (product) => product.plans)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column(() => AuditableEntity, { prefix: false })
  audit: AuditableEntity;
}
