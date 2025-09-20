import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayloadDto } from './jwt/jwt.payload.dto';
import { CurrentUserDto } from './context/dto/current-user.dto';
import { TypedConfigService } from 'src/config/config.service';

@Injectable()
export class AuthService {
  // AuthService implementation
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: TypedConfigService,
  ) {}

  public async verifyTokenAndCreateUserContext(accessToken: string) {
    const secret = this.configService.get('JWT_SECRET');
    try {
      const payload: AccessTokenPayloadDto = await this.jwtService.verifyAsync(
        accessToken,
        {
          secret,
        },
      );
      console.log('payload', payload);

      const currentUser: CurrentUserDto = {
        id: payload.id,
        nickname: payload.nickname,
        isAdmin: payload.isAdmin,
        userInput: accessToken,
      };

      return currentUser;
    } catch {
      return null;
    }
  }
}
