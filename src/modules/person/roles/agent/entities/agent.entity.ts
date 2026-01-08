import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { RealPerson } from '../../../entities/real-person.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';
import { Policy } from '../../../../policy/entities/policy.entity';

@Entity('agents')
export class Agent extends AuditableEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    agentCode: string;

    @Column({ unique: true })
    licenseNumber: string;

    @Column({ default: true })
    isActive: boolean;

    @OneToOne(() => RealPerson, { eager: true, cascade: ['insert'] })
    @JoinColumn()
    realPerson: RealPerson;

    @OneToMany(() => Policy, policy => policy.agent)
    policies: Policy[];
}
