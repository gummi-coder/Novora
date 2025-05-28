import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import { sign, verify } from 'jsonwebtoken';
import { sendEmail } from '../email';
import { redis } from '../../infrastructure/redis';
import { AuthError } from './errors';

const prisma = new PrismaClient();

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserSession {
  userId: string;
  email: string;
  roles: string[];
  companyId: string;
}

export class AuthService {
  private static instance: AuthService;
  private readonly JWT_SECRET = process.env.JWT_SECRET!;
  private readonly REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Registration
  async register(userData: {
    email: string;
    password: string;
    name: string;
    companyId: string;
  }): Promise<{ user: any; verificationToken: string }> {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new AuthError('Email already registered');
    }

    const hashedPassword = this.hashPassword(userData.password);
    const verificationToken = randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        roles: {
          connect: [{ name: 'USER' }]
        }
      }
    });

    // Store verification token in Redis with 24h expiry
    await redis.set(
      `verification:${verificationToken}`,
      user.id,
      'EX',
      24 * 60 * 60
    );

    // Send verification email
    await sendEmail({
      to: user.email,
      subject: 'Verify your email',
      template: 'verification',
      data: { verificationToken }
    });

    return { user, verificationToken };
  }

  // Login
  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: true }
    });

    if (!user || !this.verifyPassword(password, user.password)) {
      throw new AuthError('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new AuthError('Please verify your email first');
    }

    return this.generateTokens({
      userId: user.id,
      email: user.email,
      roles: user.roles.map(r => r.name),
      companyId: user.companyId
    });
  }

  // Token refresh
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = verify(refreshToken, this.REFRESH_TOKEN_SECRET) as UserSession;
      
      // Check if refresh token is blacklisted
      const isBlacklisted = await redis.get(`blacklist:${refreshToken}`);
      if (isBlacklisted) {
        throw new AuthError('Invalid refresh token');
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: { roles: true }
      });

      if (!user) {
        throw new AuthError('User not found');
      }

      return this.generateTokens({
        userId: user.id,
        email: user.email,
        roles: user.roles.map(r => r.name),
        companyId: user.companyId
      });
    } catch (error) {
      throw new AuthError('Invalid refresh token');
    }
  }

  // Logout
  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = verify(refreshToken, this.REFRESH_TOKEN_SECRET) as UserSession;
      // Blacklist the refresh token
      await redis.set(
        `blacklist:${refreshToken}`,
        payload.userId,
        'EX',
        7 * 24 * 60 * 60 // 7 days
      );
    } catch (error) {
      // Ignore invalid tokens
    }
  }

  // Password reset
  async requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      return;
    }

    const resetToken = randomBytes(32).toString('hex');
    await redis.set(
      `reset:${resetToken}`,
      user.id,
      'EX',
      1 * 60 * 60 // 1 hour
    );

    await sendEmail({
      to: email,
      subject: 'Reset your password',
      template: 'password-reset',
      data: { resetToken }
    });
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    const userId = await redis.get(`reset:${resetToken}`);
    if (!userId) {
      throw new AuthError('Invalid or expired reset token');
    }

    const hashedPassword = this.hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    await redis.del(`reset:${resetToken}`);
  }

  // Email verification
  async verifyEmail(token: string): Promise<void> {
    const userId = await redis.get(`verification:${token}`);
    if (!userId) {
      throw new AuthError('Invalid or expired verification token');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true }
    });

    await redis.del(`verification:${token}`);
  }

  // Helper methods
  private generateTokens(session: UserSession): AuthTokens {
    const accessToken = sign(session, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY
    });

    const refreshToken = sign(session, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY
    });

    return { accessToken, refreshToken };
  }

  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  private verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }
} 