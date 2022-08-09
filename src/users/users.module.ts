import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './team.entity';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Team])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
