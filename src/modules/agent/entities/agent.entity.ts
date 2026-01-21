import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { AuditableEntity } from 'src/common/entities/auditable.entity';
import { RealPerson } from '../../person/entities/real-person.entity';

@Entity('agents')
export class Agent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'code', unique: true })
    agentCode: string;

    @Column({ name: 'license_number', nullable: true, type: 'varchar' })
    licenseNumber: string | null;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @OneToOne(() => RealPerson, { cascade: true, eager: true })
    @JoinColumn({ name: 'real_person_id' })
    realPerson: RealPerson;

    @Column(() => AuditableEntity, { prefix: false })
    audit: AuditableEntity;
}
