import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { Insurer } from '../../insurer/entities/insurer.entity';

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

    @Column(() => AuditableEntity, { prefix: false })
    audit: AuditableEntity;
}
