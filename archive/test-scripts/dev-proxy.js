#!/usr/bin/env node

/**
 * Development proxy that serves both Vite frontend and Netlify functions
 */

import { createServer } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { handler as steamHandler } from './netlify/functions/steam-proxy.cjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = 8888;
const VITE_PORT = 3000;

// Create proxy for Vite frontend
const viteProxy = createProxyMiddleware({
  target: `http://localhost:${VITE_PORT}`,
  changeOrigin: true,
  ws: true, // Enable WebSocket proxy for HMR
});

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  console.log(`${req.method} ${url.pathname}${url.search}`);
  
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
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
  
  // Proxy everything else to Vite
  viteProxy(req, res);
});

server.listen(PORT, () => {
  console.log(`🚀 Development proxy running on http://localhost:${PORT}`);
  console.log(`📡 Proxying to Vite dev server on http://localhost:${VITE_PORT}`);
  console.log(`🔧 Steam API: http://localhost:${PORT}/.netlify/functions/steam-proxy.cjs`);
  console.log('');
  console.log('✨ Ready for testing!');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development proxy...');
  server.close(() => {
    process.exit(0);
  });
});