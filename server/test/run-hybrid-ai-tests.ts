#!/usr/bin/env ts-node
/**
 * Execute Hybrid AI Test Suite
 * Run this script to validate the hybrid AI architecture
 * 
 * Usage: npm run test:hybrid-ai
 */

import { HybridAITestRunner } from './hybrid-ai-test-runner';

async function main() {
  console.log('🚀 HYBRID AI ARCHITECTURE TEST SUITE');
  console.log('====================================');
  console.log(`Started: ${new Date().toISOString()}\n`);

  const testRunner = new HybridAITestRunner();

  try {
    await testRunner.runCompleteTestSuite();
    
    console.log('\n✅ ALL TESTS COMPLETED SUCCESSFULLY');
    console.log('📊 Hybrid AI architecture is production ready!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED');
    console.error('Error:', error.message);
    
    process.exit(1);
  }
}

// Run the test suite
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { main as runHybridAITests };