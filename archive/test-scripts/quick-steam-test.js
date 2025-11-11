#!/usr/bin/env node

/**
 * Quick Steam API test to verify integration
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const BASE_URL = 'http://localhost:8888';

async function testSteamAPI() {
  console.log('🧪 Quick Steam API Test\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('- STEAM_API_KEY:', process.env.STEAM_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('- STEAM_ID:', process.env.STEAM_ID ? '✅ Set' : '❌ Missing');
  console.log('');

  // Test endpoints
  const endpoints = ['profile', 'recent'];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint} endpoint...`);
      const url = `${BASE_URL}/.netlify/functions/steam-proxy.cjs?endpoint=${endpoint}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint}: Success`);
        console.log(`   Metadata: ${JSON.stringify(data._metadata || {})}`);
        
        if (endpoint === 'profile' && data.response?.players?.[0]) {
          const player = data.response.players[0];
          console.log(`   Player: ${player.personaname} (${player.steamid})`);
        }
        
        if (endpoint === 'recent' && data.response?.games) {
          console.log(`   Recent games: ${data.response.games.length} found`);
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ ${endpoint}: HTTP ${response.status}`);
        console.log(`   Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
    
    console.log('');
  }
}

// Run test
testSteamAPI().catch(console.error);