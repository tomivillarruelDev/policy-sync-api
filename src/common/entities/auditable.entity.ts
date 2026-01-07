import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn, VersionColumn } from 'typeorm';

// Base reutilizable para timestamps, soft delete y versionado optimista
export abstract class AuditableEntity {
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt?: Date | null;

    // Optimistic Lock (auto-incrementa en cada update)
    @VersionColumn({ name: 'version', default: 1 })
    version: number;
}
