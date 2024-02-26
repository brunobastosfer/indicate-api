import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}
  async generateToken(user: User): Promise<any> {
    const accessToken = jwt.sign(
      {
        scope: 'access_token',
        id: user.id,
        email: user.email,
      },
      this.configService.get('JWT_SECRET'),
      { expiresIn: '1h' },
    );

    const refreshToken = jwt.sign(
      {
        scope: 'refresh:access_token',
        id: user.id,
        email: user.email,
      },
      this.configService.get('JWT_SECRET'),
      { expiresIn: '8h' },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, this.configService.get('JWT_SECRET'));
    } catch (error) {
      return null;
    }
  }
}
