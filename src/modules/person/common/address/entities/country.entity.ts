import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { State } from "./state.entity";

@Entity()
export class Country {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @OneToMany(() => State, state => state.country)
  states: State[];
}
