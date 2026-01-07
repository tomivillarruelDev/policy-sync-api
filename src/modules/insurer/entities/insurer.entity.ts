import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Country } from '../../person/common/address/entities/country.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('insurers')
export class Insurer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column()
  documentType: string;

  @Column({ unique: true })
  documentNumber: string;

  @Column({ nullable: true })
  executive: string;

  @Column({ nullable: true })
  agencyNumber: string;

  // Relación con entidad País existente
  @ManyToOne(() => Country)
  country: Country;

  @Column()
  address: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  landline: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  logoUrl: string;

  @OneToMany(() => Product, (product) => product.insurer)
  products: Product[];
}
