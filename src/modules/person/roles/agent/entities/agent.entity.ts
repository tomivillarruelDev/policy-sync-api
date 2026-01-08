import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Person } from '../../../entities/person.entity';
import { Policy } from '../../../../policy/entities/policy.entity';

@Entity('agents')
export class Agent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    agentCode: string;

    @Column({ unique: true })
    licenseNumber: string;

    @Column({ default: true })
    isActive: boolean;

    @OneToOne(() => Person, { eager: true })
    @JoinColumn()
    person: Person;

    @OneToMany(() => Policy, policy => policy.agent)
    policies: Policy[];
}
