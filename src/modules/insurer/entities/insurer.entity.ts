import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { LegalPerson } from '../../person/entities/legal-person.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';

@Entity('insurers')
export class Insurer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  executive: string | null;

  @Column({ name: 'agency_number', nullable: true })
  agencyNumber: string | null;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string | null;

  @OneToOne(() => LegalPerson, { eager: true, cascade: ['insert'] })
  @JoinColumn({ name: 'legal_person_id' })
  legalPerson: LegalPerson;

  @OneToMany(() => Product, (product) => product.insurer)
  products: Product[];

  @Column(() => AuditableEntity, { prefix: false })
  audit: AuditableEntity;
}
