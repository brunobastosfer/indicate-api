import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { PrismaService } from 'prisma/prisma.service';
import { AuthService } from 'src/authservice/authService.service';
import { ConfigModule } from '@nestjs/config';
import { PixService } from 'src/pix/pix.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [
    PrismaService,
    UsersService,
    UsersRepository,
    AuthService,
    PixService,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
