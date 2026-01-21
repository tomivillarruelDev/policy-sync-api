import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Expose } from 'class-transformer';

@Entity({ name: 'gender' })
export class Gender {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ name: 'name_es', nullable: true })
    nameEs: string;

    @Expose()
    @Column({ unique: true })
    slug: string;

}
