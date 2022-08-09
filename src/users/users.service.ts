import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from './team.entity';
import { Repository } from 'typeorm';
import { User } from './user.entity';

enum UserFields {
  FIRST_NAME = 'first name',
  LAST_NAME = 'last name',
  EMAIL = 'email',
  ROLE_DESCRIPTION = 'role description',
  TEAM = 'team',
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private async saveTeams(names: string[]): Promise<void> {
    const uniqueNames = [...new Set(names)];
    for (const name of uniqueNames) {
      const teamName = this.teamRepository.create({ name });
      await this.teamRepository.save(teamName);
    }
  }

  private async saveUsers(users: User[]): Promise<void> {
    for (const user of users) {
      const { firstName, lastName, email, roleDescription, team } = user;
      const createdUser = this.userRepository.create({
        firstName,
        lastName,
        email,
        roleDescription,
        team,
      });
      await this.userRepository.save(createdUser);
    }
  }

  async uploadData(users: User[]): Promise<{ result: string }> {
    const mappedUsers = users
      .map((user) => ({
        firstName: user[UserFields.FIRST_NAME],
        lastName: user[UserFields.LAST_NAME],
        email: user[UserFields.EMAIL],
        roleDescription: user[UserFields.ROLE_DESCRIPTION],
        team: user[UserFields.TEAM],
      }))
      .filter((user) => user.email.trim().length !== 0);

    await this.saveTeams(mappedUsers.map((u) => u.team));
    await this.saveUsers(mappedUsers as User[]);

    return { result: 'DATA SAVED' };
  }

  async getUsers(): Promise<User[]> {
    const query = this.userRepository.createQueryBuilder('user');
    return query.getMany();
  }

  async getAllTeamsMembers(): Promise<{ team: Team; users: User[] }[]> {
    const teams = await this.teamRepository
      .createQueryBuilder('team')
      .getMany();
    const users = await this.getUsers();

    return teams.map((team) => {
      const filteredUsers = users
        .filter((user) => user.team === team.name)
        .map((user) => {
          const { firstName, lastName, email, roleDescription } = user;
          return {
            firstName,
            lastName,
            email,
            roleDescription,
          };
        });

      return {
        team: team.name,
        users: filteredUsers,
      } as unknown as { team: Team; users: User[] };
    });
  }
}
