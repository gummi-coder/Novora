import { test, expect, Page } from '@playwright/test';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  firstName: 'Test',
  lastName: 'User'
};

const testCompany = {
  name: 'Test Company',
  industry: 'Technology',
  size: '10-50'
};

const testSurvey = {
  title: 'Employee Satisfaction Survey',
  description: 'A comprehensive survey to measure employee satisfaction',
  type: 'employee_feedback'
};

// Helper functions
async function login(page: Page) {
  await page.goto('/auth/signin');
  await page.fill('[data-testid="email-input"]', testUser.email);
  await page.fill('[data-testid="password-input"]', testUser.password);
  await page.click('[data-testid="signin-button"]');
  await page.waitForURL('/dashboard');
}

async function createCompany(page: Page) {
  await page.goto('/dashboard');
  await page.click('[data-testid="create-company-button"]');
  await page.fill('[data-testid="company-name-input"]', testCompany.name);
  await page.selectOption('[data-testid="industry-select"]', testCompany.industry);
  await page.selectOption('[data-testid="size-select"]', testCompany.size);
  await page.click('[data-testid="save-company-button"]');
  await page.waitForSelector('[data-testid="company-created-success"]');
}

async function createSurvey(page: Page) {
  await page.goto('/surveys/create');
  
  // Step 1: Basic Information
  await page.fill('[data-testid="survey-title-input"]', testSurvey.title);
  await page.fill('[data-testid="survey-description-input"]', testSurvey.description);
  await page.selectOption('[data-testid="survey-type-select"]', testSurvey.type);
  await page.click('[data-testid="next-step-button"]');
  
  // Step 2: Questions
  await page.waitForSelector('[data-testid="questions-step"]');
  await page.click('[data-testid="add-question-bank-button"]');
  await page.click('[data-testid="question-item-1"]'); // Select first question
  await page.click('[data-testid="add-question-button"]');
  await page.click('[data-testid="next-step-button"]');
  
  // Step 3: Settings
  await page.waitForSelector('[data-testid="settings-step"]');
  await page.click('[data-testid="anonymous-responses-checkbox"]');
  await page.fill('[data-testid="max-responses-input"]', '100');
  await page.click('[data-testid="next-step-button"]');
  
  // Step 4: Language & Branding
  await page.waitForSelector('[data-testid="branding-step"]');
  await page.selectOption('[data-testid="language-select"]', 'en');
  await page.fill('[data-testid="primary-color-input"]', '#3B82F6');
  await page.click('[data-testid="next-step-button"]');
  
  // Step 5: Preview
  await page.waitForSelector('[data-testid="preview-step"]');
  await page.click('[data-testid="mobile-preview-button"]');
  await page.click('[data-testid="desktop-preview-button"]');
  await page.click('[data-testid="next-step-button"]');
  
  // Step 6: Distribution
  await page.waitForSelector('[data-testid="distribution-step"]');
  await page.click('[data-testid="email-distribution-button"]');
  await page.fill('[data-testid="email-list-input"]', 'test@example.com, user@example.com');
  await page.click('[data-testid="next-step-button"]');
  
  // Step 7: Save & Send
  await page.waitForSelector('[data-testid="save-step"]');
  await page.click('[data-testid="save-draft-button"]');
  await page.waitForSelector('[data-testid="survey-saved-success"]');
}

async function takeSurvey(page: Page, surveyUrl: string) {
  await page.goto(surveyUrl);
  
  // Fill out survey
  await page.click('[data-testid="rating-option-4"]'); // Select rating 4
  await page.fill('[data-testid="text-answer-input"]', 'Great work environment!');
  await page.click('[data-testid="submit-survey-button"]');
  
  await page.waitForSelector('[data-testid="survey-completed"]');
}

async function viewAnalytics(page: Page, surveyId: string) {
  await page.goto(`/surveys/${surveyId}/analytics`);
  
  // Check analytics data
  await expect(page.locator('[data-testid="total-responses"]')).toBeVisible();
  await expect(page.locator('[data-testid="response-rate"]')).toBeVisible();
  await expect(page.locator('[data-testid="average-rating"]')).toBeVisible();
}

test.describe('Survey Workflow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Register user and create company
    await page.goto('/auth/signup');
    await page.fill('[data-testid="first-name-input"]', testUser.firstName);
    await page.fill('[data-testid="last-name-input"]', testUser.lastName);
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="signup-button"]');
    await page.waitForSelector('[data-testid="registration-success"]');
    
    await createCompany(page);
  });

  test('Complete survey creation workflow', async ({ page }) => {
    await login(page);
    await createSurvey(page);
    
    // Verify survey was created
    await page.goto('/surveys');
    await expect(page.locator(`text=${testSurvey.title}`)).toBeVisible();
  });

  test('Survey taking workflow', async ({ page, context }) => {
    await login(page);
    await createSurvey(page);
    
    // Get survey URL
    await page.goto('/surveys');
    await page.click(`[data-testid="survey-${testSurvey.title}"]`);
    const surveyUrl = await page.locator('[data-testid="survey-url"]').textContent();
    
    // Take survey in new context (simulating different user)
    const newPage = await context.newPage();
    await takeSurvey(newPage, surveyUrl!);
    
    // Verify response was recorded
    await page.reload();
    await expect(page.locator('[data-testid="response-count"]')).toContainText('1');
  });

  test('Analytics and reporting', async ({ page, context }) => {
    await login(page);
    await createSurvey(page);
    
    // Get survey ID
    await page.goto('/surveys');
    await page.click(`[data-testid="survey-${testSurvey.title}"]`);
    const surveyId = await page.locator('[data-testid="survey-id"]').textContent();
    
    // Take multiple surveys
    const surveyUrl = await page.locator('[data-testid="survey-url"]').textContent();
    
    for (let i = 0; i < 3; i++) {
      const newPage = await context.newPage();
      await takeSurvey(newPage, surveyUrl!);
      await newPage.close();
    }
    
    // View analytics
    await viewAnalytics(page, surveyId!);
    
    // Verify analytics data
    await expect(page.locator('[data-testid="total-responses"]')).toContainText('3');
    await expect(page.locator('[data-testid="average-rating"]')).toBeVisible();
  });

  test('Auto-pilot survey scheduling', async ({ page }) => {
    await login(page);
    
    // Create auto-pilot plan
    await page.goto('/auto-pilot');
    await page.click('[data-testid="create-plan-button"]');
    
    await page.fill('[data-testid="plan-name-input"]', 'Weekly Employee Check-in');
    await page.fill('[data-testid="plan-description-input"]', 'Weekly employee satisfaction check');
    await page.selectOption('[data-testid="schedule-type-select"]', 'weekly');
    await page.selectOption('[data-testid="survey-template-select"]', 'employee_feedback');
    await page.click('[data-testid="save-plan-button"]');
    
    await page.waitForSelector('[data-testid="plan-created-success"]');
    
    // Verify plan was created
    await expect(page.locator('text=Weekly Employee Check-in')).toBeVisible();
    await expect(page.locator('[data-testid="plan-status-active"]')).toBeVisible();
  });

  test('Question bank management', async ({ page }) => {
    await login(page);
    
    // View question bank
    await page.goto('/question-bank');
    await expect(page.locator('[data-testid="question-bank-list"]')).toBeVisible();
    
    // Filter by category
    await page.selectOption('[data-testid="category-filter"]', 'employee_satisfaction');
    await expect(page.locator('[data-testid="question-item"]')).toHaveCount(20); // Should show 20 questions
    
    // Search questions
    await page.fill('[data-testid="search-input"]', 'satisfaction');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="question-item"]')).toBeVisible();
    
    // Add question to favorites
    await page.click('[data-testid="favorite-button-1"]');
    await expect(page.locator('[data-testid="favorite-button-1"]')).toHaveClass(/favorited/);
  });

  test('Survey templates and cloning', async ({ page }) => {
    await login(page);
    await createSurvey(page);
    
    // Save as template
    await page.goto('/surveys');
    await page.click(`[data-testid="survey-${testSurvey.title}"]`);
    await page.click('[data-testid="save-template-button"]');
    await page.fill('[data-testid="template-name-input"]', 'Employee Satisfaction Template');
    await page.click('[data-testid="confirm-save-template"]');
    
    await page.waitForSelector('[data-testid="template-saved-success"]');
    
    // Clone from template
    await page.goto('/surveys/create');
    await page.click('[data-testid="use-template-button"]');
    await page.click('[data-testid="template-Employee Satisfaction Template"]');
    await page.click('[data-testid="use-template-confirm"]');
    
    // Verify template was applied
    await expect(page.locator('[data-testid="survey-title-input"]')).toHaveValue(testSurvey.title);
  });

  test('Response management and export', async ({ page, context }) => {
    await login(page);
    await createSurvey(page);
    
    // Take multiple surveys
    const surveyUrl = await page.locator('[data-testid="survey-url"]').textContent();
    
    for (let i = 0; i < 5; i++) {
      const newPage = await context.newPage();
      await takeSurvey(newPage, surveyUrl!);
      await newPage.close();
    }
    
    // View responses
    await page.goto('/surveys');
    await page.click(`[data-testid="survey-${testSurvey.title}"]`);
    await page.click('[data-testid="view-responses-button"]');
    
    await expect(page.locator('[data-testid="response-item"]')).toHaveCount(5);
    
    // Export responses
    await page.click('[data-testid="export-responses-button"]');
    await page.selectOption('[data-testid="export-format-select"]', 'csv');
    await page.click('[data-testid="download-export-button"]');
    
    // Verify download started
    await expect(page.locator('[data-testid="export-success"]')).toBeVisible();
  });

  test('Survey sharing and collaboration', async ({ page, context }) => {
    await login(page);
    await createSurvey(page);
    
    // Share survey
    await page.goto('/surveys');
    await page.click(`[data-testid="survey-${testSurvey.title}"]`);
    await page.click('[data-testid="share-survey-button"]');
    
    // Generate QR code
    await page.click('[data-testid="generate-qr-button"]');
    await expect(page.locator('[data-testid="qr-code"]')).toBeVisible();
    
    // Copy survey link
    await page.click('[data-testid="copy-link-button"]');
    await expect(page.locator('[data-testid="link-copied-success"]')).toBeVisible();
    
    // Test shared link
    const surveyUrl = await page.locator('[data-testid="survey-url"]').textContent();
    const newPage = await context.newPage();
    await newPage.goto(surveyUrl!);
    await expect(newPage.locator('[data-testid="survey-form"]')).toBeVisible();
  });

  test('Survey analytics and insights', async ({ page, context }) => {
    await login(page);
    await createSurvey(page);
    
    // Take surveys with different responses
    const surveyUrl = await page.locator('[data-testid="survey-url"]').textContent();
    
    const responses = [
      { rating: 5, text: 'Excellent!' },
      { rating: 4, text: 'Very good' },
      { rating: 3, text: 'Good' },
      { rating: 2, text: 'Needs improvement' },
      { rating: 1, text: 'Poor' }
    ];
    
    for (const response of responses) {
      const newPage = await context.newPage();
      await newPage.goto(surveyUrl!);
      await newPage.click(`[data-testid="rating-option-${response.rating}"]`);
      await newPage.fill('[data-testid="text-answer-input"]', response.text);
      await newPage.click('[data-testid="submit-survey-button"]');
      await newPage.close();
    }
    
    // View analytics
    await page.goto('/surveys');
    await page.click(`[data-testid="survey-${testSurvey.title}"]`);
    await page.click('[data-testid="view-analytics-button"]');
    
    // Check analytics data
    await expect(page.locator('[data-testid="total-responses"]')).toContainText('5');
    await expect(page.locator('[data-testid="average-rating"]')).toContainText('3.0');
    await expect(page.locator('[data-testid="rating-distribution"]')).toBeVisible();
    await expect(page.locator('[data-testid="response-trends"]')).toBeVisible();
  });

  test('Survey settings and customization', async ({ page }) => {
    await login(page);
    await createSurvey(page);
    
    // Edit survey settings
    await page.goto('/surveys');
    await page.click(`[data-testid="survey-${testSurvey.title}"]`);
    await page.click('[data-testid="edit-survey-button"]');
    
    // Update settings
    await page.click('[data-testid="settings-tab"]');
    await page.click('[data-testid="require-authentication-checkbox"]');
    await page.fill('[data-testid="max-responses-input"]', '50');
    await page.fill('[data-testid="expiration-date-input"]', '2024-12-31');
    await page.click('[data-testid="save-settings-button"]');
    
    await page.waitForSelector('[data-testid="settings-saved-success"]');
    
    // Customize branding
    await page.click('[data-testid="branding-tab"]');
    await page.fill('[data-testid="primary-color-input"]', '#FF6B6B');
    await page.fill('[data-testid="logo-url-input"]', 'https://example.com/logo.png');
    await page.selectOption('[data-testid="font-select"]', 'Inter');
    await page.click('[data-testid="save-branding-button"]');
    
    await page.waitForSelector('[data-testid="branding-saved-success"]');
  });

  test('Error handling and edge cases', async ({ page }) => {
    await login(page);
    
    // Test invalid survey creation
    await page.goto('/surveys/create');
    await page.click('[data-testid="next-step-button"]'); // Try to proceed without title
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Survey title is required');
    
    // Test network error handling
    await page.route('**/api/v1/surveys', route => route.abort());
    await page.fill('[data-testid="survey-title-input"]', 'Test Survey');
    await page.click('[data-testid="save-draft-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to save survey');
    
    // Test offline handling
    await page.setOffline(true);
    await page.click('[data-testid="save-draft-button"]');
    await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();
  });

  test('Performance and load testing', async ({ page, context }) => {
    await login(page);
    await createSurvey(page);
    
    // Test with multiple concurrent users
    const surveyUrl = await page.locator('[data-testid="survey-url"]').textContent();
    const promises = [];
    
    for (let i = 0; i < 10; i++) {
      const newPage = await context.newPage();
      promises.push(takeSurvey(newPage, surveyUrl!));
    }
    
    await Promise.all(promises);
    
    // Verify all responses were recorded
    await page.reload();
    await expect(page.locator('[data-testid="response-count"]')).toContainText('10');
  });

  test('Accessibility and usability', async ({ page }) => {
    await login(page);
    await createSurvey(page);
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Test screen reader compatibility
    await expect(page.locator('[aria-label="Survey title input"]')).toBeVisible();
    await expect(page.locator('[role="button"]')).toBeVisible();
    
    // Test color contrast
    const colorContrast = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="primary-button"]');
      const style = window.getComputedStyle(element!);
      return style.color;
    });
    
    expect(colorContrast).toBeDefined();
  });

  test('Mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    await login(page);
    await createSurvey(page);
    
    // Test mobile navigation
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // Test mobile form inputs
    await page.fill('[data-testid="survey-title-input"]', 'Mobile Test Survey');
    await expect(page.locator('[data-testid="survey-title-input"]')).toHaveValue('Mobile Test Survey');
    
    // Test mobile preview
    await page.click('[data-testid="preview-button"]');
    await page.click('[data-testid="mobile-preview-button"]');
    await expect(page.locator('[data-testid="mobile-preview"]')).toBeVisible();
  });
});
