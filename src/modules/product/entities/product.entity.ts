import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Insurer } from '../../insurer/entities/insurer.entity';
import { Plan } from '../../plan/entities/plan.entity';

import { AuditableEntity } from '../../../common/entities/auditable.entity';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    code: string;

    @Column()
    branch: string; // Ramo: Automóviles, Vida, etc.

    // Valores Económicos
    @Column({ type: 'decimal', precision: 12, scale: 2 })
    insuredAmount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    specialBenefits: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    adminExpenses: number;

    // Configuración de Deducibles
    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    deductibleOne: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    deductibleTwo: number;

    @ManyToOne(() => Insurer, (insurer) => insurer.products)
    insurer: Insurer;

    @OneToMany(() => Plan, (plan) => plan.product)
    plans: Plan[];

    @Column(() => AuditableEntity, { prefix: false })
    audit: AuditableEntity;
}
