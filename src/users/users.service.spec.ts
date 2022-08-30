import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InputUser, User } from './dto/user.entity';
import { Team } from './dto/team.entity';
import {
  inputUserDataMock,
  teamDataMock,
  teamMembersDataMock,
  userDataMock,
} from './testData/mockedData';

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
    const result = await service.getTeamMembers();
    expect(result).toEqual(teamMembersDataMock);
    expect(userRepositoryMock.createQueryBuilder).toHaveBeenCalledWith('user');
    expect(userRepositoryMock.createQueryBuilder).toHaveBeenCalledTimes(1);
    expect(teamRepositoryMock.createQueryBuilder).toHaveBeenCalledWith('team');
    expect(teamRepositoryMock.createQueryBuilder).toHaveBeenCalledTimes(1);
  });

  it('when uploadData is called, users and teams should be saved to data base', async () => {
    const numberOfUser = inputUserDataMock.length;
    const numberOfTeam = teamDataMock.length;

    const result = await service.uploadData(
      inputUserDataMock as unknown as InputUser[],
    );
    expect(result).toEqual({ result: 'DATA SAVED' });
    expect(userRepositoryMock.create).toHaveBeenCalledTimes(numberOfUser);
    expect(userRepositoryMock.save).toHaveBeenCalledTimes(numberOfUser);
    expect(teamRepositoryMock.create).toHaveBeenCalledTimes(numberOfTeam);
    expect(teamRepositoryMock.save).toHaveBeenCalledTimes(numberOfTeam);
  });
});
