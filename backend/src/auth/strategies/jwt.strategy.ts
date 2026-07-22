import { Injectable, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;   // user id
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'changeme',
    });
  }

  async validate(payload: JwtPayload) {
    // Check if user is banned on every authenticated request
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, is_banned: true },
    });

    if (!user) {
      throw new ForbiddenException('User no longer exists.');
    }

    if (user.is_banned) {
      throw new ForbiddenException('Your account has been suspended. Contact support for more information.');
    }

    // This object is attached to req.user
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
