import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as CSVToJSON from 'csvtojson';
import { Team } from './team.entity';
import { User } from './user.entity';
import { Express } from 'express';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('/uploadFile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCSVFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ result: string }> {
    const users = await CSVToJSON().fromString(file.buffer.toString());
    return this.usersService.uploadData(users);
  }

  @Get('/all')
  async getUsers(): Promise<User[]> {
    return this.usersService.getUsers();
  }

  @Get('/groupedByTeam')
  async getAllTeamsMembers(): Promise<{ team: Team; users: User[] }[]> {
    return this.usersService.getAllTeamsMembers();
  }
}
