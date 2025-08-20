import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Country } from "./country.entity";
import { City } from "./city.entity";

@Entity()
export class State {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Country, country => country.states, { onDelete: "CASCADE", eager: true })
  country: Country;

  @OneToMany(() => City, city => city.state)
  cities: City[];
}
