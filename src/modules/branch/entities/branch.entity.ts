import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { Insurer } from '../../insurer/entities/insurer.entity';
import { RiskType } from '../enums/risk-type.enum';

@Entity('branches')
export class Branch {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    code: string;

    @ManyToOne(() => Insurer)
    @JoinColumn({ name: 'insurer_id' })
    insurer: Insurer;

    @Column({ type: 'enum', enum: RiskType, default: RiskType.OTHER, name: 'risk_type' })
    riskType: RiskType;

    @Column(() => AuditableEntity, { prefix: false })
    audit: AuditableEntity;
}
