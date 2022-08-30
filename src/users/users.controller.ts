import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as CSVToJSON from 'csvtojson';
import { User } from './dto/user.entity';
import { Express } from 'express';
import { Team } from './dto/team.entity';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('/uploadFile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCSVFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ code: number; response: string }> {
    const users = await CSVToJSON().fromString(file.buffer.toString());
    try {
      await this.usersService.uploadData(users);
    } catch (e) {
      throw Error(e);
    }
    return {
      code: 200,
      response: 'SUCCESS',
    };
  }

  @Get('/all')
  async getUsers(): Promise<User[]> {
    return this.usersService.getUsers();
  }

  @Get('/members/:teamName')
  async getTeamMembers(@Param('teamName') teamName: string): Promise<User[]> {
    return this.usersService.getTeamMembers(teamName);
  }

  @Get('/teams')
  async getTeams(): Promise<Team[]> {
    return this.usersService.getTeams();
  }
}
