/**
 * Playwright Configuration
 * Phase 1 Week 5-6: Testing Infrastructure
 * End-to-end testing configuration for Amazon.com/Shopee.sg quality standards
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './client/src/test/e2e',
  outputDir: './test-results',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Workers
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }],
    ['list'],
  ],
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Global test settings
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Emulate user preferences
    colorScheme: 'light',
    locale: 'en-US',
    timezoneId: 'America/New_York',
    
    // Performance settings
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // Tablet testing
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'] },
    },
    
    // Bangladesh-specific testing
    {
      name: 'Bangladesh Mobile',
      use: {
        ...devices['Galaxy S9+'],
        locale: 'bn-BD',
        timezoneId: 'Asia/Dhaka',
      },
    },
    
    // Performance testing
    {
      name: 'Performance',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--no-sandbox', '--disable-dev-shm-usage'],
        },
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Global setup and teardown
  globalSetup: './client/src/test/global-setup.ts',
  globalTeardown: './client/src/test/global-teardown.ts',
});