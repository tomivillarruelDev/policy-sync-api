import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Person } from '../../../entities/person.entity';
// Import Policy later when created

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

    // @OneToMany(() => Policy, policy => policy.agent)
    // policies: Policy[];
}
