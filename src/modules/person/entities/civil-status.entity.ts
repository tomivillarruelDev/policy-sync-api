import { AuditableEntity } from 'src/common/entities/auditable.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('civil_status')
export class CivilStatus {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ name: 'name_es', nullable: true })
    nameEs: string;

    @Column({ unique: true })
    slug: string;

    @Column(() => AuditableEntity, { prefix: false })
    audit: AuditableEntity;
}
