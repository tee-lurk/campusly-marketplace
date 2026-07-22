import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';

/** ms-compatible duration strings accepted by jsonwebtoken */
type Duration = `${number}${'s' | 'm' | 'h' | 'd' | 'w'}`;

const ACCESS_EXPIRES: Duration = '15m';
const REFRESH_EXPIRES: Duration = '7d';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ─── Register ────────────────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) throw new ConflictException('Email already registered.');

    const existingProfile = await this.prisma.profile.findUnique({
      where: { username: dto.username },
    });
    if (existingProfile) throw new ConflictException('Username already taken.');

    const password_hash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.$transaction(async (tx: PrismaService) => {
      const newUser = await tx.user.create({
        data: { email: dto.email, password_hash, role: 'user' },
      });
      await tx.profile.create({
        data: {
          user_id: newUser.id,
          username: dto.username,
          name: dto.name,
          bio: null,
          avatar_url: null,
          is_verified: false,
        },
      });
      return newUser;
    });

    return this.generateTokens(user.id, user.email, user.role);
  }

  // ─── Login ────────────────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid email or password.');

    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid) throw new UnauthorizedException('Invalid email or password.');

    if (user.is_banned) {
      throw new ForbiddenException('Your account has been suspended. Contact support for more information.');
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  // ─── Refresh ──────────────────────────────────────────────────────────────────
  async refresh(dto: RefreshTokenDto) {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(dto.refresh_token, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'changeme_refresh',
      });
    } catch {
      throw new BadRequestException('Invalid or expired refresh token.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('User no longer exists.');

    if (user.is_banned) {
      throw new ForbiddenException('Your account has been suspended. Contact support for more information.');
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  // ─── Private ──────────────────────────────────────────────────────────────────
  private generateTokens(userId: string, email: string, role: string) {
    const payload: JwtPayload = { sub: userId, email, role };

    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET ?? 'changeme',
      expiresIn: ACCESS_EXPIRES,
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET ?? 'changeme_refresh',
      expiresIn: REFRESH_EXPIRES,
    });

    return { access_token, refresh_token };
  }
}
