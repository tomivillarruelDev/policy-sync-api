import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'gender' })
export class Gender {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ name: 'name_es', nullable: true })
    nameEs: string;

    @Column({ unique: true })
    slug: string;

}
