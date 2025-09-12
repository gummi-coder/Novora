import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';
import {
  Session,
  SessionConfig,
  SessionEvent,
  SessionManagementRequest,
} from '../types/session';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL);

export class SessionManager {
  private static instance: SessionManager;
  private config: SessionConfig;

  private constructor() {
    this.config = {
      maxConcurrentSessions: 5,
      sessionLifespan: 3600,
      refreshTokenLifespan: 2592000,
      inactivityTimeout: 1800,
      requireDeviceVerification: false,
      allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [],
    };
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  async createSession(userId: string, deviceInfo: any, ip: string): Promise<Session> {
    // Check concurrent sessions limit
    const activeSessions = await this.getActiveSessions(userId);
    if (activeSessions.length >= this.config.maxConcurrentSessions) {
      throw new Error('Maximum concurrent sessions reached');
    }

    // Generate tokens
    const token = this.generateToken(userId);
    const refreshToken = this.generateRefreshToken(userId);

    // Get device and location info
    const ua = new UAParser(deviceInfo.userAgent);
    const geo = geoip.lookup(ip);

    const session: Session = {
      id: uuidv4(),
      userId,
      token,
      refreshToken,
      deviceInfo: {
        name: deviceInfo.name || 'Unknown Device',
        type: this.getDeviceType(ua),
        browser: ua.getBrowser().name || 'Unknown',
        os: ua.getOS().name || 'Unknown',
        ip,
        location: geo ? {
          country: geo.country,
          city: geo.city,
          timezone: geo.timezone,
        } : undefined,
      },
      status: 'active',
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + this.config.sessionLifespan * 1000),
      createdAt: new Date(),
    };

    // Store session
    await this.storeSession(session);
    await this.recordSessionEvent(session.id, 'login');

    return session;
  }

  async refreshSession(sessionId: string, refreshToken: string): Promise<Session> {
    const session = await this.getSession(sessionId);
    
    if (!session || session.refreshToken !== refreshToken || session.status !== 'active') {
      throw new Error('Invalid session');
    }

    // Update session
    session.token = this.generateToken(session.userId);
    session.refreshToken = this.generateRefreshToken(session.userId);
    session.lastActivity = new Date();
    session.expiresAt = new Date(Date.now() + this.config.sessionLifespan * 1000);

    await this.storeSession(session);
    await this.recordSessionEvent(session.id, 'refresh');

    return session;
  }

  async revokeSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      session.status = 'revoked';
      await this.storeSession(session);
      await this.recordSessionEvent(session.id, 'revoke');
    }
  }

  async revokeAllSessions(userId: string): Promise<void> {
    const sessions = await this.getActiveSessions(userId);
    await Promise.all(sessions.map(session => this.revokeSession(session.id)));
  }

  async validateSession(sessionId: string, token: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    
    if (!session || session.token !== token || session.status !== 'active') {
      return false;
    }

    // Check expiration
    if (new Date() > session.expiresAt) {
      session.status = 'expired';
      await this.storeSession(session);
      await this.recordSessionEvent(session.id, 'expire');
      return false;
    }

    // Check inactivity
    const inactiveTime = Date.now() - session.lastActivity.getTime();
    if (inactiveTime > this.config.inactivityTimeout * 1000) {
      session.status = 'expired';
      await this.storeSession(session);
      await this.recordSessionEvent(session.id, 'expire');
      return false;
    }

    // Update last activity
    session.lastActivity = new Date();
    await this.storeSession(session);

    return true;
  }

  async getActiveSessions(userId: string): Promise<Session[]> {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        status: 'active',
      },
    });
    return sessions as Session[];
  }

  async handleSessionManagement(request: SessionManagementRequest): Promise<any> {
    switch (request.action) {
      case 'list':
        return this.getActiveSessions(request.userId!);
      case 'revoke':
        return this.revokeSession(request.sessionId!);
      case 'revokeAll':
        return this.revokeAllSessions(request.userId!);
      default:
        throw new Error('Invalid action');
    }
  }

  private async storeSession(session: Session): Promise<void> {
    // Store in Redis for quick access
    await redis.set(
      `session:${session.id}`,
      JSON.stringify(session),
      'EX',
      this.config.sessionLifespan
    );

    // Store in database for persistence
    await prisma.session.upsert({
      where: { id: session.id },
      update: session,
      create: session,
    });
  }

  private async getSession(sessionId: string): Promise<Session | null> {
    // Try Redis first
    const cachedSession = await redis.get(`session:${sessionId}`);
    if (cachedSession) {
      return JSON.parse(cachedSession);
    }

    // Fall back to database
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (session) {
      // Cache the session
      await redis.set(
        `session:${sessionId}`,
        JSON.stringify(session),
        'EX',
        this.config.sessionLifespan
      );
    }

    return session as Session | null;
  }

  private async recordSessionEvent(sessionId: string, type: SessionEvent['type']): Promise<void> {
    const event: SessionEvent = {
      id: uuidv4(),
      sessionId,
      type,
      timestamp: new Date(),
    };

    await prisma.sessionEvent.create({
      data: event,
    });
  }

  private generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: this.config.sessionLifespan }
    );
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: this.config.refreshTokenLifespan }
    );
  }

  private getDeviceType(ua: UAParser): Session['deviceInfo']['type'] {
    const device = ua.getDevice();
    if (device.type === 'mobile') return 'mobile';
    if (device.type === 'tablet') return 'tablet';
    return 'desktop';
  }
} 