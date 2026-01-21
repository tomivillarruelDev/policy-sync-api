import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Branch } from '../../branch/entities/branch.entity';
import { LegalPerson } from '../../person/entities/legal-person.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';

@Entity('insurers')
export class Insurer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true, type: 'varchar' })
  executive: string | null;

  @Column({ name: 'agency_number', nullable: true, type: 'varchar' })
  agencyNumber: string | null;

  @Column({ name: 'logo_url', nullable: true, type: 'varchar' })
  logoUrl: string | null;

  @OneToOne(() => LegalPerson, { eager: true, cascade: ['insert'] })
  @JoinColumn({ name: 'legal_person_id' })
  legalPerson: LegalPerson;

  @OneToMany(() => Product, (product) => product.insurer)
  products: Product[];

  @OneToMany(() => Branch, (branch) => branch.insurer)
  branches: Branch[];

  @Column(() => AuditableEntity, { prefix: false })
  audit: AuditableEntity;
}
