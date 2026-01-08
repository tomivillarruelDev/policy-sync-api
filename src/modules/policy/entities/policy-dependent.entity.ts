import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Policy } from './policy.entity';
import { RelationType } from '../enums/relation-type.enum';

@Entity('policy_dependents')
export class PolicyDependent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ type: 'enum', enum: RelationType })
    relationType: RelationType;

    @Column({ type: 'date' })
    birthDate: Date;

    @ManyToOne(() => Policy, (policy) => policy.dependents, { onDelete: 'CASCADE' })
    policy: Policy;
}
