import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDTO, UpdateUserDTO } from './dto/userDto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(user: CreateUserDTO): Promise<User> {
    return this.prisma.user.create({
      data: user,
    });
  }

  async updateUser(id: string, updatedUser: UpdateUserDTO) {
    return await this.prisma.user.update({
      where: { id },
      data: updatedUser,
    });
  }

  async auth(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    if (user.passwd !== password) {
      return null;
    }

    return user;
  }
}
