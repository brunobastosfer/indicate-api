import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDTO, UpdateUserDTO } from './dto/userDto';
import { UsersRepository } from './users.repository';
import { User } from '@prisma/client';
import { AuthService } from 'src/authservice/authService.service';
import { PixService } from 'src/pix/pix.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authService: AuthService,
    private readonly pixService: PixService,
  ) {}

  createUser(user: CreateUserDTO) {
    return this.usersRepository.createUser(user);
  }

  updateUser(id: string, updatedUser: UpdateUserDTO) {
    return this.usersRepository.updateUser(id, updatedUser);
  }

  async auth(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.usersRepository.auth(email, password);
      const data = await this.authService.generateToken(user);
      return data;
    } catch (error) {
      throw new UnauthorizedException('Erro ao autenticar o usuário');
    }
  }

  async getQrCode() {
    return await this.pixService.run();
  }
}
