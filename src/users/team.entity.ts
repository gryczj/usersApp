import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Team {
  @PrimaryColumn()
  name: string;
}
