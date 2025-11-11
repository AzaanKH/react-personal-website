#!/usr/bin/env node

/**
 * Development server with Steam API testing
 * 
 * This script starts the development server and runs Steam API tests
 * to ensure everything is working correctly during development.
 */

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';
import SteamAPITester from './tests/steam-api/steam-api.test.js';

const DEV_URL = 'http://localhost:8888';
const TEST_DELAY = 5000; // Wait 5 seconds for server to start

async function startDevelopment() {
    console.log('🚀 Starting development server with Steam API testing...\n');

    // Start netlify dev
    console.log('📡 Starting Netlify Dev server...');
    const netlifyProcess = spawn('netlify', ['dev'], {
        stdio: 'inherit',
        shell: true
    });

    // Handle process cleanup
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down development server...');
        netlifyProcess.kill('SIGINT');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        netlifyProcess.kill('SIGTERM');
        process.exit(0);
    });

    // Wait for server to start
    console.log(`⏳ Waiting ${TEST_DELAY / 1000} seconds for server to start...`);
    await setTimeout(TEST_DELAY);

    // Run Steam API tests
    console.log('\n🧪 Running Steam API integration tests...\n');
    
    try {
        process.env.TEST_BASE_URL = DEV_URL;
        const tester = new SteamAPITester();
        const success = await tester.runAllTests();
        
        if (success) {
            console.log('\n✅ Steam API tests passed! Development server is ready.');
            console.log(`🌐 Open your browser to: ${DEV_URL}`);
            console.log(`🧪 Test dashboard: ${DEV_URL}/steam-test.html`);
        } else {
            console.log('\n⚠️  Some Steam API tests failed, but development server will continue running.');
            console.log('💡 Check your .env file and ensure STEAM_API_KEY and STEAM_ID are set correctly.');
            console.log(`🧪 Test dashboard: ${DEV_URL}/steam-test.html`);
        }
    } catch (error) {
        console.log(`\n❌ Steam API test error: ${error.message}`);
        console.log('💡 This might be normal if the server is still starting up.');
        console.log(`🧪 You can manually test at: ${DEV_URL}/steam-test.html`);
    }

    console.log('\n🔄 Development server is running. Press Ctrl+C to stop.\n');

    // Keep the process alive
    netlifyProcess.on('exit', (code) => {
        console.log(`\n📡 Netlify Dev server exited with code ${code}`);
        process.exit(code);
    });
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    startDevelopment().catch(error => {
        console.error('💥 Failed to start development environment:', error.message);
        process.exit(1);
    });
}