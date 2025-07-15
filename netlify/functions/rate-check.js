// netlify/functions/rate-check.js
// Fail-safe rate limiting check that won't break the website

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Check if Upstash environment variables are available
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.log('Upstash not configured, allowing request');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          allowed: true,
          message: 'Rate limiting not configured - request allowed',
          status: 'disabled'
        })
      };
    }

    // Dynamically import Upstash (fail-safe)
    let Ratelimit, Redis;
    try {
      const upstashRatelimit = await import('@upstash/ratelimit');
      const upstashRedis = await import('@upstash/redis');
      Ratelimit = upstashRatelimit.Ratelimit;
      Redis = upstashRedis.Redis;
    } catch (importError) {
      console.warn('Upstash modules not available:', importError.message);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          allowed: true,
          message: 'Rate limiting modules not available - request allowed',
          status: 'disabled'
        })
      };
    }

    // Initialize Redis client
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Configure rate limiting (3 submissions per 10 minutes)
    const ratelimit = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(3, '10 m'),
      analytics: true,
      prefix: 'contact_rate_limit',
    });

    // Get client IP
    const clientIP = event.headers['x-forwarded-for'] || 
                     event.headers['x-real-ip'] || 
                     context.clientContext?.identity?.url || 
                     'unknown';

    // Apply rate limiting
    const { success, limit, reset, remaining } = await ratelimit.limit(clientIP);
    
    if (!success) {
      const resetDate = new Date(reset);
      const resetTime = resetDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      return {
        statusCode: 429,
        headers: {
          ...headers,
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': Math.round((reset - Date.now()) / 1000).toString()
        },
        body: JSON.stringify({
          allowed: false,
          message: `Too many contact form submissions. Please wait until ${resetTime} before trying again.`,
          retryAfter: Math.round((reset - Date.now()) / 1000),
          resetTime: resetTime,
          status: 'rate_limited'
        })
      };
    }

    // Rate limit check passed
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': (remaining - 1).toString(),
        'X-RateLimit-Reset': reset.toString()
      },
      body: JSON.stringify({
        allowed: true,
        message: 'Rate limit check passed',
        remaining: remaining - 1,
        resetTime: new Date(reset).toISOString(),
        status: 'active'
      })
    };

  } catch (error) {
    console.error('Rate limit check error:', error);
    
    // FAIL-SAFE: If anything goes wrong, allow the request
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        allowed: true,
        message: 'Rate limiting error - request allowed as fallback',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Rate limiting temporarily unavailable',
        status: 'error_fallback'
      })
    };
  }
};