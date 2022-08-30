import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import * as fs from 'fs';
import * as streamBuffer from 'stream-buffers';
import * as Path from 'path';
import { UsersService } from './users.service';
import {
  team1MembersDataMock,
  team2MembersDataMock,
  userDataMock,
} from './testData/mockedData';

const fileToBuffer = (filename) => {
  const readStream = fs.createReadStream(filename);
  const chunks = [];
  return new Promise((resolve, reject) => {
    readStream.on('error', (err) => {
      reject(err);
    });
    readStream.on('data', (chunk) => {
      chunks.push(chunk);
    });
    readStream.on('close', () => {
      resolve(Buffer.concat(chunks));
    });
  });
};

describe('UsersController', () => {
  let controller: UsersController;
  let userServiceMock;

  beforeEach(async () => {
    userServiceMock = {
      uploadData: jest.fn().mockReturnValue({ result: 'DATA SAVED' }),
      getUsers: jest.fn().mockReturnValue(userDataMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: userServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('when getUsers is called, correct array of users is returned', async () => {
    const result = await controller.getUsers();
    expect(result).toEqual(userDataMock);
    expect(userServiceMock.getUsers).toHaveBeenCalled();
  });

  test.each([
    ['team1', team1MembersDataMock],
    ['team2', team2MembersDataMock],
  ])('should return all members from %s', async (teamName, members) => {
    userServiceMock.getTeamMembers = jest.fn().mockReturnValue(members);
    const result = await controller.getTeamMembers(teamName);
    expect(result).toEqual(members);
  });

  it('file uploaded successfully', async () => {
    const fileName = 'users.csv';

    const imageBuffer = (await fileToBuffer(
      Path.join(__dirname, 'testData', fileName),
    )) as Buffer;
    const myReadableStreamBuffer = new streamBuffer.ReadableStreamBuffer({
      frequency: 10,
      chunkSize: 2048,
    });
    const csvFile: Express.Multer.File = {
      buffer: imageBuffer,
      fieldname: 'file',
      originalname: myReadableStreamBuffer,
      encoding: 'UTF-16le',
      mimetype: 'text/csv',
      destination: __dirname,
      filename: fileName,
      path: Path.join(__dirname, fileName),
      size: 955578,
      stream: myReadableStreamBuffer,
    };
    const result = await controller.uploadCSVFile(csvFile);
    expect(result).toEqual({ result: 'DATA SAVED' });
  });
});
