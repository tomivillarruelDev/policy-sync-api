import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { RealPerson } from '../../../entities/real-person.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';
import { Policy } from '../../../../policy/entities/policy.entity';

@Entity('agents')
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'agent_code', unique: true })
  agentCode: string;

  @Column({ name: 'license_number', unique: true })
  licenseNumber: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToOne(() => RealPerson, { eager: true, cascade: ['insert'] })
  @JoinColumn({ name: 'real_person_id' })
  realPerson: RealPerson;

  @OneToMany(() => Policy, (policy) => policy.agent)
  policies: Policy[];

  @Column(() => AuditableEntity, { prefix: false })
  audit: AuditableEntity;
}
