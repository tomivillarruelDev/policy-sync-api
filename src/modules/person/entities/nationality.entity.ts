import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AuditableEntity } from 'src/common/entities/auditable.entity';
import { RealPerson } from './real-person.entity';

@Entity({ name: 'nationalities' })
export class Nationality {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ name: 'name_es', nullable: true })
    nameEs: string;

    @OneToMany(() => RealPerson, (realPerson) => realPerson.nationality)
    realPeople: RealPerson[];

    @Column(() => AuditableEntity, { prefix: false })
    audit: AuditableEntity;
}
