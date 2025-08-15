/**
 * Phase 1 Backend API Test
 * Tests Document Verification API endpoints
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function testBackendEndpoints() {
  console.log('🚀 Testing Phase 1 Document Verification Backend APIs...\n');

  const tests = [
    {
      name: 'Document Types API',
      command: 'curl -s http://localhost:5000/api/v1/documents/types',
      validate: (output) => output.includes('nid_front') && output.includes('trade_license')
    },
    {
      name: 'Document Quality Assessment (Error handling)',
      command: 'curl -s -X POST http://localhost:5000/api/v1/documents/quality',
      validate: (output) => output.includes('error') || output.includes('No file uploaded')
    },
    {
      name: 'Document Authenticity Check (Error handling)',
      command: 'curl -s -X POST http://localhost:5000/api/v1/documents/authenticity',
      validate: (output) => output.includes('error') || output.includes('No file uploaded')
    },
    {
      name: 'OCR Extraction (Error handling)',
      command: 'curl -s -X POST http://localhost:5000/api/v1/documents/extract',
      validate: (output) => output.includes('error') || output.includes('No file uploaded')
    },
    {
      name: 'Document Validation API',
      command: 'curl -s -X POST http://localhost:5000/api/v1/documents/validate -H "Content-Type: application/json" -d \'{"documentType": "nid_front", "extractedData": {"nid_number": "123", "name": "Test"}}\'',
      validate: (output) => output.includes('validationResults') || output.includes('overallScore')
    },
    {
      name: 'Cross-Reference Validation API',
      command: 'curl -s -X POST http://localhost:5000/api/v1/documents/cross-reference -H "Content-Type: application/json" -d \'{"documents": {"nid": {"name": "Test"}}}\'',
      validate: (output) => output.includes('matchScore') || output.includes('isConsistent')
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const { stdout } = await execAsync(test.command);
      if (test.validate(stdout)) {
        console.log(`✅ ${test.name}: PASSED`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED - Validation failed`);
        console.log(`   Output: ${stdout.substring(0, 100)}...`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: FAILED - ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  console.log(`🎉 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
}

testBackendEndpoints().catch(console.error);