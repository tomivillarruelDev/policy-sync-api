import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Person } from "./person.entity";
import { AuditableEntity } from "src/common/entities/auditable.entity";

@Entity()
export class Email {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  account: string;

  @ManyToOne(() => Person, person => person.emails, { onDelete: "CASCADE" })
  person: Person;

  @Column(() => AuditableEntity, { prefix: false })
  audit: AuditableEntity;
}
