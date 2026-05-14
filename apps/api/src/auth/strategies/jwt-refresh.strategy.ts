import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface RefreshUserPayload {
  id: string;
  refreshToken: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: config
        .getOrThrow<string>('JWT_PUBLIC_KEY')
        .replace(/\\n/g, '\n'),
      algorithms: ['RS256'],
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: { sub: string }): RefreshUserPayload {
    return {
      id: payload.sub,
      refreshToken: (req.body as { refreshToken: string }).refreshToken,
    };
  }
}
