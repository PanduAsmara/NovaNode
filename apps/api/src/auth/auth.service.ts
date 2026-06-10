import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { UserRole, type JwtPayload } from '@novanode/shared';
import * as bcrypt from 'bcryptjs';
import { createHash } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import type { LoginDto } from './dto/login.dto';
import type { SetupDto } from './dto/setup.dto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /** True when no users exist — the Setup Wizard must run. */
  async needsSetup(): Promise<boolean> {
    const count = await this.prisma.user.count();
    return count === 0;
  }

  /** First-run only: creates the initial OWNER account. */
  async setup(dto: SetupDto): Promise<AuthTokens> {
    if (!(await this.needsSetup())) {
      throw new BadRequestException('Setup has already been completed');
    }
    const passwordHash = await this.hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        username: dto.username,
        email: dto.email,
        passwordHash,
        role: UserRole.OWNER,
      },
    });
    return this.issueTokens({ sub: user.id, email: user.email, role: user.role });
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens({ sub: user.id, email: user.email, role: user.role });
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = this.sha256(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { userId: payload.sub, tokenHash, revokedAt: null },
    });
    if (!stored || stored.expiresAt < this.now()) {
      throw new UnauthorizedException('Refresh token expired or revoked');
    }

    // Rotate: revoke the used token and issue a fresh pair.
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: this.now() },
    });
    return this.issueTokens({ sub: payload.sub, email: payload.email, role: payload.role });
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: this.now() },
    });
  }

  async profile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }

  // --- helpers ---

  private async issueTokens(payload: JwtPayload): Promise<AuthTokens> {
    const accessOptions: JwtSignOptions = {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn: this.config.get<string>('jwt.accessExpiresIn', '15m') as JwtSignOptions['expiresIn'],
    };
    const refreshOptions: JwtSignOptions = {
      secret: this.config.get<string>('jwt.refreshSecret'),
      expiresIn: this.config.get<string>('jwt.refreshExpiresIn', '7d') as JwtSignOptions['expiresIn'],
    };

    const accessToken = await this.jwt.signAsync({ ...payload }, accessOptions);
    const refreshToken = await this.jwt.signAsync({ ...payload }, refreshOptions);

    await this.persistRefreshToken(payload.sub, refreshToken);
    return { accessToken, refreshToken };
  }

  private async persistRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const decoded = this.jwt.decode(refreshToken) as { exp?: number } | null;
    const expiresAt = decoded?.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({
      data: { userId, tokenHash: this.sha256(refreshToken), expiresAt },
    });
  }

  private async hashPassword(password: string): Promise<string> {
    const rounds = this.config.get<number>('bcryptSaltRounds', 12);
    return bcrypt.hash(password, rounds);
  }

  private sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private now(): Date {
    return new Date();
  }
}
