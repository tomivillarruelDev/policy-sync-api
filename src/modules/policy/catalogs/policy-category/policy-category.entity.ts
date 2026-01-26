import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { AuditableEntity } from 'src/common/entities/auditable.entity';

@Entity({ name: 'policy_category' })
export class PolicyCategory {
    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Expose()
    @Column()
    name: string;

    @Expose()
    @Column({ name: 'name_es', nullable: true })
    nameEs: string;

    @Expose()
    @Column({ unique: true })
    slug: string;

    @Column(() => AuditableEntity, { prefix: false })
    audit: AuditableEntity;
}
