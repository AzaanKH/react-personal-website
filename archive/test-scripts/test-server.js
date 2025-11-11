#!/usr/bin/env node

/**
 * Simple test server to replicate Netlify Dev functionality for testing
 */

import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { handler as steamHandler } from './netlify/functions/steam-proxy.cjs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const PORT = 8888;

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  console.log(`${req.method} ${url.pathname}${url.search}`);
  
  // Handle Steam API function
  if (url.pathname === '/.netlify/functions/steam-proxy.cjs') {
    try {
      const queryParams = {};
      url.searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });
      
      const event = {
        httpMethod: req.method,
        queryStringParameters: queryParams,
        headers: req.headers
      };
      
      const result = await steamHandler(event, {});
      
      res.writeHead(result.statusCode, result.headers);
      res.end(result.body);
      return;
    } catch (error) {
      console.error('Steam function error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
      return;
    }
  }
  
  // Handle static files
  if (url.pathname === '/debug-steam.html' || url.pathname === '/steam-test.html' || url.pathname === '/test-react-steam.html') {
    try {
      const filePath = join(__dirname, 'public', url.pathname.substring(1));
      const content = readFileSync(filePath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
      return;
    } catch (error) {
      console.error('File error:', error);
    }
  }
  
  // Default 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`🧪 Steam API test: http://localhost:${PORT}/.netlify/functions/steam-proxy.cjs?endpoint=profile`);
  console.log(`🌐 Debug page: http://localhost:${PORT}/debug-steam.html`);
  console.log('');
  
  // Test the Steam API
  testSteamAPI();
});

async function testSteamAPI() {
  console.log('🧪 Testing Steam API endpoints...\n');
  
  const endpoints = ['profile', 'recent'];
  
  for (const endpoint of endpoints) {
    try {
      const url = `http://localhost:${PORT}/.netlify/functions/steam-proxy.cjs?endpoint=${endpoint}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint}: Success`);
        
        if (endpoint === 'profile' && data.response?.players?.[0]) {
          const player = data.response.players[0];
          console.log(`   Player: ${player.personaname}`);
        }
        
        if (endpoint === 'recent' && data.response?.games) {
          console.log(`   Recent games: ${data.response.games.length}`);
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ ${endpoint}: HTTP ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
  
  console.log('\n🎯 Test server ready! You can now test the frontend integration.');
}