import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthService } from './authservice/authService.service';
import { HttpModule } from '@nestjs/axios';
import { PixService } from './pix/pix.service';

@Module({
  imports: [UsersModule, HttpModule],
  controllers: [AppController],
  providers: [AppService, AuthService, PixService],
})
export class AppModule {}
