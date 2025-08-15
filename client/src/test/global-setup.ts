/**
 * Global Test Setup for Playwright
 * Phase 1 Week 5-6: Testing Infrastructure
 */

import { chromium } from '@playwright/test';

async function globalSetup() {
  // Start server if not running
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Check if server is running
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    console.log('✅ Server is running on http://localhost:3000');
  } catch (error) {
    console.log('❌ Server is not running. Start server with: npm run dev');
    throw error;
  }
  
  await browser.close();
}

export default globalSetup;