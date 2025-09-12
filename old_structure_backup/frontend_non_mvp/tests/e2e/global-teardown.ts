import { chromium, FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Cleanup test data
  await cleanupTestData(page);
  
  await browser.close();
}

async function cleanupTestData(page: any) {
  // Navigate to cleanup endpoint
  await page.goto('/api/test/cleanup');
  
  // Wait for cleanup to complete
  await page.waitForResponse(response => 
    response.url().includes('/api/test/cleanup') && response.status() === 200
  );
  
  console.log('✅ Test data cleanup completed');
}

export default globalTeardown;
