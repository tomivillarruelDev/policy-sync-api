import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { AuditableEntity } from '../../../common/entities/auditable.entity';
import { Insurer } from '../../insurer/entities/insurer.entity';

@Entity('branches')
@Unique(['code', 'insurer'])
export class Branch extends AuditableEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    code: string;

    @ManyToOne(() => Insurer)
    @JoinColumn({ name: 'insurer_id' })
    insurer: Insurer;
}
