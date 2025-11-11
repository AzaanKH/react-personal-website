#!/usr/bin/env node

/**
 * Direct test of the Steam API function without requiring a running server
 */

import { handler } from './netlify/functions/steam-proxy.cjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testSteamFunction() {
  console.log('🧪 Direct Steam Function Test\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('- STEAM_API_KEY:', process.env.STEAM_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('- STEAM_ID:', process.env.STEAM_ID ? '✅ Set' : '❌ Missing');
  console.log('');

  // Test profile endpoint
  const profileEvent = {
    httpMethod: 'GET',
    queryStringParameters: { endpoint: 'profile' },
    headers: {}
  };

  try {
    console.log('Testing profile endpoint directly...');
    const result = await handler(profileEvent, {});
    
    console.log('Status Code:', result.statusCode);
    console.log('Headers:', result.headers);
    
    if (result.statusCode === 200) {
      const data = JSON.parse(result.body);
      console.log('✅ Profile Success!');
      console.log('Response keys:', Object.keys(data));
      if (data.response?.players?.[0]) {
        const player = data.response.players[0];
        console.log(`Player: ${player.personaname} (${player.steamid})`);
      }
    } else {
      console.log('❌ Profile Failed');
      console.log('Error:', result.body);
    }
  } catch (error) {
    console.log('❌ Profile Error:', error.message);
    console.log('Stack:', error.stack);
  }

  console.log('\n');

  // Test recent games endpoint
  const recentEvent = {
    httpMethod: 'GET',
    queryStringParameters: { endpoint: 'recent' },
    headers: {}
  };

  try {
    console.log('Testing recent games endpoint directly...');
    const result = await handler(recentEvent, {});
    
    console.log('Status Code:', result.statusCode);
    
    if (result.statusCode === 200) {
      const data = JSON.parse(result.body);
      console.log('✅ Recent Games Success!');
      if (data.response?.games) {
        console.log(`Recent games: ${data.response.games.length} found`);
      }
    } else {
      console.log('❌ Recent Games Failed');
      console.log('Error:', result.body);
    }
  } catch (error) {
    console.log('❌ Recent Games Error:', error.message);
  }
}

// Run test
testSteamFunction().catch(console.error);