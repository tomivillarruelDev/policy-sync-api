import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from '../../product/entities/product.entity';

import { AuditableEntity } from '../../../common/entities/auditable.entity';

@Entity('plans')
export class Plan extends AuditableEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    code: string;

    @Column({ nullable: true })
    phoneNumber: string;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    deductibleOne: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    deductibleTwo: number;

    @ManyToOne(() => Product, (product) => product.plans)
    product: Product;
}
