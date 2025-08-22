import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Identification } from './identification.entity';

@Entity()
export class IdentificationType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  nameEs: string;

  @OneToMany(() => Identification, (identification) => identification.type)
  identifications: Identification[];
}
