import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Policy } from './policy.entity';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { Expose } from 'class-transformer';
import { City } from 'src/modules/person/common/address/entities/city.entity';

@Entity('policy_insured_properties')
export class PolicyInsuredProperty {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // --- Ubicación --- 
    @Expose()
    @ManyToOne(() => City, { eager: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'city_id' })
    city: City;

    @Column()
    street: string;

    @Column({ name: 'street_number', nullable: true })
    streetNumber: string;

    @Column({ name: 'zip_code', nullable: true })
    zipCode: string;

    @Column({ nullable: true })
    apartment: string;

    @Column({ nullable: true })
    floor: string;

    @Column({ name: 'is_permanent_residence', default: false })
    isPermanentResidence: boolean;

    // --- Constructivo ---
    @Expose()
    @Column({ name: 'property_type', nullable: true })
    propertyType: string; //crear Select de tipo de propiedad - Tabla Satelite

    @Expose()
    @Column({ name: 'roof_material', nullable: true })
    roofMaterial: string; //crear Select de material de techo - Tabla Satelite

    @Column({ name: 'total_square_meters', type: 'float', nullable: true })
    totalSquareMeters: number;

    @Column({ name: 'built_square_meters', type: 'float', nullable: true })
    builtSquareMeters: number;

    // --- Seguridad ---
    @Column({ name: 'has_alarm', default: false })
    hasAlarm: boolean;

    @Column({ name: 'has_reinforced_door', default: false })
    hasReinforcedDoor: boolean;

    @Column({ name: 'window_bars', default: false })
    windowBars: boolean;

    // --- Sumas Aseguradas ---
    @Column({ name: 'building_fire_sum', type: 'decimal', precision: 12, scale: 2, nullable: true })
    buildingFireSum: number;

    @Column({ name: 'content_fire_sum', type: 'decimal', precision: 12, scale: 2, nullable: true })
    contentFireSum: number;

    @Column({ name: 'theft_sum', type: 'decimal', precision: 12, scale: 2, nullable: true })
    theftSum: number;

    // Relación con Policy
    @ManyToOne(() => Policy, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'policy_id' })
    policy: Policy;

    // Auditoría (Composición)
    @Column(() => AuditableEntity, { prefix: false })
    audit: AuditableEntity;
}
