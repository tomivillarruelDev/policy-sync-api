import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Policy } from './policy.entity';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { Country } from 'src/modules/person/common/address/entities/country.entity';
import { Expose } from 'class-transformer';

@Entity('policy_insured_vehicles')
export class PolicyInsuredVehicle {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'usage_type', nullable: true }) //crear Select de uso
    usageType: string;

    @Column({ name: 'vehicle_type', nullable: true }) //crear Select de tipo de vehiculo
    vehicleType: string;

    @Column({ nullable: true }) //crear Select de marca cascada
    brand: string;

    @Column({ nullable: true }) //crear Select de modelo cascada
    model: string;

    @Column({ nullable: true }) //crear Select de version cascada
    version: string;

    @Column({ type: 'int', nullable: true })
    year: number;

    @Column({ nullable: true })
    plate: string;

    @Column({ nullable: true })
    chassis: string;

    @Column({ nullable: true })
    engine: string;

    @Column({ name: 'insured_value', type: 'decimal', precision: 12, scale: 2, nullable: true })
    insuredValue: number;

    @Expose()
    @ManyToOne(() => Country, { eager: false, onDelete: 'CASCADE', })
    @JoinColumn({ name: 'country_id' })
    country: Country;

    @Column({ type: 'text', nullable: true })
    address: string;

    // Relación con Policy
    @ManyToOne(() => Policy, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'policy_id' })
    policy: Policy;

    // Auditoría (Composición)
    @Column(() => AuditableEntity, { prefix: false })
    audit: AuditableEntity;
}
