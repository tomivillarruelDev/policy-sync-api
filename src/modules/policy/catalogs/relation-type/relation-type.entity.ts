import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { AuditableEntity } from 'src/common/entities/auditable.entity';

@Entity({ name: 'relation_type' })
export class RelationType {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ name: 'name_es', nullable: true })
    nameEs: string;

    @Expose()
    @Column({ unique: true })
    slug: string;

    @Column(() => AuditableEntity, { prefix: false })
    audit: AuditableEntity;
}
