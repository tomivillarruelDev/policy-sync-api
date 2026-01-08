import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { LegalPerson } from '../../person/entities/legal-person.entity';
import { AuditableEntity } from 'src/common/entities/auditable.entity';

@Entity('insurers')
export class Insurer extends AuditableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  executive: string;

  @Column({ nullable: true })
  agencyNumber: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  identification: string;

  @Column({ nullable: true })
  identificationType: string;

  @OneToOne(() => LegalPerson, { eager: true, cascade: ['insert'] })
  @JoinColumn()
  legalPerson: LegalPerson;

  @OneToMany(() => Product, (product) => product.insurer)
  products: Product[];
}
