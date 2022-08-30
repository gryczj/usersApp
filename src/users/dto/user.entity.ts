import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Team } from './team.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  roleDescription: string;

  @ManyToOne((type) => Team)
  team: Team;
}

export class InputUser {
  firstName: string;

  lastName: string;

  email: string;

  roleDescription: string;

  team: string;
}
