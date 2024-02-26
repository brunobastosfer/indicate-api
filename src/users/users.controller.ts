import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateUserDTO } from './dto/userDto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post()
  async create(@Body() createUserDto: CreateUserDTO) {
    return await this.usersService.createUser(createUserDto);
  }

  @Put(':id')
  async update(@Body() updateUserDto: CreateUserDTO, @Param('id') id: string) {
    return await this.usersService.updateUser(id, updateUserDto);
  }

  @Post('auth/login')
  @HttpCode(200)
  async auth(@Body() { email, password }) {
    const token = await this.usersService.auth(email, password);
    return { data: token };
  }

  @Get('pix/token')
  async getQrCode() {
    return await this.usersService.getQrCode();
  }
}
