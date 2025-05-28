import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { app } from '../../../server';

const prisma = new PrismaClient();

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    // Clean up database
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
        },
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        id: user.id,
        email: user.email,
        name: user.name,
      });
    });

    it('should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'email',
        })
      );
    });
  });
}); 