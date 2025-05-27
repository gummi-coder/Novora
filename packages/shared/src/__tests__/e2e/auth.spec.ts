import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and storage before each test
    await page.context().clearCookies();
  });

  test('should login successfully', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill in login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for navigation and check URL
    await page.waitForURL('/dashboard');
    expect(page.url()).toContain('/dashboard');

    // Check for user menu
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in login form with invalid credentials
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Check for error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Invalid credentials'
    );
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/dashboard');

    // Should redirect to login
    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Click logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Should redirect to login
    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');
  });
}); 