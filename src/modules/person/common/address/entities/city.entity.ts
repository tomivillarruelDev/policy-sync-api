import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { State } from "./state.entity";

@Entity()
export class City {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => State, state => state.cities, { onDelete: "CASCADE", eager: true })
  state: State;
}
