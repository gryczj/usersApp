import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Team } from './team.entity';
import {
  inputUserDataMock,
  teamDataMock,
  teamMembersDataMock,
  userDataMock,
} from './mockedData';

describe('UsersService', () => {
  let service: UsersService;
  let userRepositoryMock;
  let teamRepositoryMock;

  beforeEach(async () => {
    userRepositoryMock = {
      createQueryBuilder: jest.fn().mockImplementation(() => ({
        getMany: jest.fn().mockReturnValue(userDataMock),
      })),
      create: jest.fn(),
      save: jest.fn(),
    };
    teamRepositoryMock = {
      createQueryBuilder: jest.fn().mockImplementation(() => ({
        getMany: jest.fn().mockReturnValue(teamDataMock),
      })),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
        {
          provide: getRepositoryToken(Team),
          useValue: teamRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('when getUsers is called, query for user table is created', async () => {
    const result = await service.getUsers();
    expect(result).toEqual(userDataMock);
    expect(userRepositoryMock.createQueryBuilder).toHaveBeenCalledWith('user');
    expect(userRepositoryMock.createQueryBuilder).toHaveBeenCalledTimes(1);
  });

  it('when getAllTeamsMembers is called, queries for user and team tables are created', async () => {
    const result = await service.getAllTeamsMembers();
    expect(result).toEqual(teamMembersDataMock);
    expect(userRepositoryMock.createQueryBuilder).toHaveBeenCalledWith('user');
    expect(userRepositoryMock.createQueryBuilder).toHaveBeenCalledTimes(1);
    expect(teamRepositoryMock.createQueryBuilder).toHaveBeenCalledWith('team');
    expect(teamRepositoryMock.createQueryBuilder).toHaveBeenCalledTimes(1);
  });

  it('when uploadData is called, users and teams should be saved to data base', async () => {
    const numberOfUser = inputUserDataMock.length;
    const numberOfTeam = teamDataMock.length;

    // I would add new input type for User
    const result = await service.uploadData(
      inputUserDataMock as unknown as User[],
    );
    expect(result).toEqual({ result: 'DATA SAVED' });
    expect(userRepositoryMock.create).toHaveBeenCalledTimes(numberOfUser);
    expect(userRepositoryMock.save).toHaveBeenCalledTimes(numberOfUser);
    expect(teamRepositoryMock.create).toHaveBeenCalledTimes(numberOfTeam);
    expect(teamRepositoryMock.save).toHaveBeenCalledTimes(numberOfTeam);
  });
});
