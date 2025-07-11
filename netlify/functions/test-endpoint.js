// netlify/functions/test-endpoint.js
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { httpMethod, path, queryStringParameters, body } = event;
    
    switch (httpMethod) {
      case 'GET':
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            message: 'Test endpoint working!',
            timestamp: new Date().toISOString(),
            method: httpMethod,
            path: path,
            query: queryStringParameters || {},
            environment: process.env.NODE_ENV || 'development'
          })
        };

      case 'POST':
        const requestBody = body ? JSON.parse(body) : {};
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            message: 'POST request received',
            timestamp: new Date().toISOString(),
            receivedData: requestBody,
            echo: `Hello, ${requestBody.name || 'anonymous'}!`
          })
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({
            error: 'Method not allowed',
            allowedMethods: ['GET', 'POST']
          })
        };
    }
  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Function error:', error);
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};