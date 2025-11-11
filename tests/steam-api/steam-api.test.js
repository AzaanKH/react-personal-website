/**
 * Steam API Integration Tests
 * 
 * Tests the Steam API proxy function to ensure it's working correctly
 * before deployment or during development.
 */

import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:8888';
const TIMEOUT = 10000; // 10 seconds

class SteamAPITester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async test(name, testFn) {
    console.log(`🧪 Testing: ${name}`);
    try {
      const startTime = Date.now();
      await testFn();
      const duration = Date.now() - startTime;
      console.log(`✅ PASS: ${name} (${duration}ms)`);
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASS', duration });
    } catch (error) {
      console.log(`❌ FAIL: ${name}`);
      console.log(`   Error: ${error.message}`);
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAIL', error: error.message });
    }
  }

  async testEndpoint(endpoint, expectedKeys = []) {
    const url = `${BASE_URL}/.netlify/functions/steam-proxy.cjs?endpoint=${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON response, got: ${contentType}`);
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data.response) {
        throw new Error('Missing "response" property in Steam API response');
      }

      // Check for expected keys if provided
      for (const key of expectedKeys) {
        if (!(key in data.response)) {
          throw new Error(`Missing expected key "${key}" in response`);
        }
      }

      // Validate metadata
      if (!data._metadata) {
        throw new Error('Missing "_metadata" property');
      }

      if (data._metadata.endpoint !== endpoint) {
        throw new Error(`Metadata endpoint mismatch: expected ${endpoint}, got ${data._metadata.endpoint}`);
      }

      return data;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Steam API Integration Tests\n');

    // Test 1: Environment Variables
    await this.test('Environment Variables Loaded', async () => {
      const requiredVars = ['STEAM_API_KEY', 'STEAM_ID'];
      for (const varName of requiredVars) {
        if (!process.env[varName]) {
          throw new Error(`Missing required environment variable: ${varName}`);
        }
      }
    });

    // Test 2: Netlify Function Accessibility
    await this.test('Netlify Function Accessible', async () => {
      const response = await fetch(`${BASE_URL}/.netlify/functions/steam-proxy.cjs`, {
        signal: AbortSignal.timeout(TIMEOUT)
      });
      
      // Should return 400 for missing endpoint parameter
      if (response.status !== 400) {
        throw new Error(`Expected 400 status for missing endpoint, got ${response.status}`);
      }
    });

    // Test 3: Profile Endpoint
    await this.test('Steam Profile Endpoint', async () => {
      const data = await this.testEndpoint('profile', ['players']);
      
      if (!Array.isArray(data.response.players)) {
        throw new Error('Players should be an array');
      }

      if (data.response.players.length === 0) {
        throw new Error('No player data returned - check Steam ID or profile privacy');
      }

      const player = data.response.players[0];
      if (!player.steamid || !player.personaname) {
        throw new Error('Player missing required fields (steamid, personaname)');
      }
    });

    // Test 4: Recent Games Endpoint
    await this.test('Steam Recent Games Endpoint', async () => {
      const data = await this.testEndpoint('recent', ['games']);
      
      if (!Array.isArray(data.response.games)) {
        throw new Error('Games should be an array');
      }

      // Note: Recent games can be empty if no games played recently
      if (data.response.games.length > 0) {
        const game = data.response.games[0];
        if (!game.appid || !game.name) {
          throw new Error('Game missing required fields (appid, name)');
        }
      }
    });

    // Test 5: Invalid Endpoint
    await this.test('Invalid Endpoint Handling', async () => {
      const response = await fetch(`${BASE_URL}/.netlify/functions/steam-proxy.cjs?endpoint=invalid`, {
        signal: AbortSignal.timeout(TIMEOUT)
      });
      
      if (response.status !== 400) {
        throw new Error(`Expected 400 status for invalid endpoint, got ${response.status}`);
      }

      const data = await response.json();
      if (!data.error || !data.availableEndpoints) {
        throw new Error('Invalid endpoint should return error and available endpoints');
      }
    });

    // Test 6: Response Caching Headers
    await this.test('Response Caching Headers', async () => {
      const response = await fetch(`${BASE_URL}/.netlify/functions/steam-proxy.cjs?endpoint=profile`, {
        signal: AbortSignal.timeout(TIMEOUT)
      });
      
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const cacheControl = response.headers.get('cache-control');
      if (!cacheControl || !cacheControl.includes('max-age')) {
        throw new Error('Missing or invalid Cache-Control header');
      }
    });

    this.printResults();
    return this.results.failed === 0;
  }

  printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📝 Total:  ${this.results.tests.length}`);

    if (this.results.failed > 0) {
      console.log('\n🔍 Failed Tests:');
      this.results.tests
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
          console.log(`   • ${test.name}: ${test.error}`);
        });
    }

    console.log(`\n${this.results.failed === 0 ? '🎉 All tests passed!' : '💥 Some tests failed!'}`);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new SteamAPITester();
  tester.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test runner crashed:', error);
      process.exit(1);
    });
}

export default SteamAPITester;