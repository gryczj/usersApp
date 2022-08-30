import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from './dto/team.entity';
import { Repository } from 'typeorm';
import { InputUser, User } from './dto/user.entity';

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

  async uploadData(users: InputUser[]): Promise<{ result: string }> {
    console.info('Uploading data from CSV file...');

    const mappedUsers = users
      .map((user) => ({
        firstName: user[UserFields.FIRST_NAME],
        lastName: user[UserFields.LAST_NAME],
        email: user[UserFields.EMAIL],
        roleDescription: user[UserFields.ROLE_DESCRIPTION],
        team: user[UserFields.TEAM].toLowerCase(),
      }))
      .filter((user) => {
        const emptyEmail = user.email.trim().length === 0;
        if (!emptyEmail) {
          return true;
        }
        console.warn(
          `User: ${JSON.stringify(user)} skipped as email is empty.`,
        );
      });

    await this.saveTeams(mappedUsers.map((u) => u.team));
    await this.saveUsers(mappedUsers);
    return { result: 'DATA SAVED' };
  }

  async getUsers(): Promise<User[]> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.team', 'team');
    return query.getMany();
  }

  async getTeamMembers(teamName: string): Promise<User[]> {
    await this.findTeam(teamName);

    return await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.team', 'team')
      .where('team.name = :teamName', { teamName })
      .getMany();
  }

  private async saveTeams(teams: string[]): Promise<void> {
    console.info('Saving teams to database...');

    const uniqueTeamNames = [...new Set(teams)];
    const teamEntities = uniqueTeamNames.map((team) => {
      return this.teamRepository.create({ name: team });
    });

    try {
      await this.teamRepository.save(teamEntities);
    } catch (e) {
      throw Error(e);
    }
  }

  private async createAndSaveUser(user: InputUser): Promise<void> {
    const requestedTeam = await this.findTeam(user.team);

    const createdUser = this.userRepository.create({
      ...user,
      team: requestedTeam,
    });

    try {
      await this.userRepository.save(createdUser);
    } catch (e) {
      throw Error(e);
    }
  }

  private async saveUsers(users: InputUser[]): Promise<void> {
    console.info('Saving users to database...');

    users.forEach(() => this.createAndSaveUser);
  }

  async getTeams(): Promise<Team[]> {
    return await this.teamRepository.createQueryBuilder('team').getMany();
  }

  private async findTeam(teamName: string): Promise<Team> {
    const found = (await this.getTeams()).find((t) => t.name === teamName);
    if (!found) {
      throw Error(`Team: ${teamName} not found.`);
    }
    return found;
  }
}
