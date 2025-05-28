import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AuthService } from '../../services/auth-service';
import { UserService } from '../../services/user-service';
import { prisma } from '../../lib/prisma';

describe('Authentication Flow', () => {
  const authService = new AuthService();
  const userService = new UserService();
  let testUser: any;

  beforeAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        email: 'test@example.com'
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        email: 'test@example.com'
      }
    });
  });

  it('should complete full authentication flow', async () => {
    // 1. Register new user
    const registerResult = await authService.register({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });
    expect(registerResult).toHaveProperty('token');
    expect(registerResult).toHaveProperty('user');
    testUser = registerResult.user;

    // 2. Login with new user
    const loginResult = await authService.login('test@example.com', 'password123');
    expect(loginResult).toHaveProperty('token');
    expect(loginResult).toHaveProperty('user');

    // 3. Get user profile
    const profile = await userService.getProfile(testUser.id);
    expect(profile).toHaveProperty('email', 'test@example.com');
    expect(profile).toHaveProperty('name', 'Test User');

    // 4. Update user profile
    const updatedProfile = await userService.updateProfile(testUser.id, {
      name: 'Updated Name'
    });
    expect(updatedProfile).toHaveProperty('name', 'Updated Name');

    // 5. Delete user
    await userService.deleteUser(testUser.id);
    await expect(
      userService.getProfile(testUser.id)
    ).rejects.toThrow('User not found');
  });
}); 