#!/usr/bin/env node

/**
 * Simple test runner for Steam API integration tests
 * Usage: node tests/steam-api/run-tests.js [--dev]
 */

import SteamAPITester from './steam-api.test.js';

const isDev = process.argv.includes('--dev');
const baseUrl = isDev ? 'http://localhost:8888' : (process.env.TEST_BASE_URL || 'http://localhost:8888');

console.log(`🌐 Testing against: ${baseUrl}`);
console.log(`🔧 Mode: ${isDev ? 'Development' : 'Production'}\n`);

// Set the base URL for the tests
process.env.TEST_BASE_URL = baseUrl;

const tester = new SteamAPITester();

// Run the tests
tester.runAllTests()
  .then(success => {
    if (success) {
      console.log('\n🎉 All Steam API tests passed! Ready for deployment.');
      process.exit(0);
    } else {
      console.log('\n💥 Steam API tests failed! Please fix issues before deploying.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Test runner error:', error.message);
    process.exit(1);
  });