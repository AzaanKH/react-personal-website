exports.handler = async (event, context) => {
  console.log('🧪 Steam test function called');
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      NETLIFY: process.env.NETLIFY,
      CONTEXT: process.env.CONTEXT,
      hasApiKey: !!process.env.STEAM_API_KEY,
      hasSteamId: !!process.env.STEAM_ID,
      timestamp: new Date().toISOString()
    };

    console.log('🔍 Environment check:', envCheck);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Steam test function working',
        environment: envCheck,
        success: true
      })
    };

  } catch (error) {
    console.error('❌ Steam test error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Steam test function error',
        message: error.message,
        success: false
      })
    };
  }
};