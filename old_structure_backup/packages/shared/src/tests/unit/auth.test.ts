import { describe, it, expect } from 'vitest';
import { AuthService } from '../../services/auth-service';

describe('AuthService', () => {
  const authService = new AuthService();

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const result = await authService.login('test@example.com', 'password123');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
    });

    it('should throw error with invalid credentials', async () => {
      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const result = await authService.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'Test User'
      });
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
    });

    it('should throw error with existing email', async () => {
      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        })
      ).rejects.toThrow('Email already exists');
    });
  });
}); 