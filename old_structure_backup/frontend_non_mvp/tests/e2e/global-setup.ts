import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Setup test database and data
  await setupTestData(page);
  
  await browser.close();
}

async function setupTestData(page: any) {
  // Navigate to setup endpoint or create test data
  await page.goto('/api/test/setup');
  
  // Wait for setup to complete
  await page.waitForResponse(response => 
    response.url().includes('/api/test/setup') && response.status() === 200
  );
  
  console.log('✅ Test data setup completed');
}

export default globalSetup;
