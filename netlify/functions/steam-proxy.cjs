exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': process.env.NETLIFY && process.env.CONTEXT === 'production'
      ? 'https://azaankhalfe.netlify.app' 
      : '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const STEAM_API_KEY = process.env.STEAM_API_KEY;
    const STEAM_ID = process.env.STEAM_ID;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Steam API: Environment check:', {
        hasApiKey: !!STEAM_API_KEY,
        hasSteamId: !!STEAM_ID,
        nodeEnv: process.env.NODE_ENV,
        netlifyContext: process.env.CONTEXT
      });
    }
    
    if (!STEAM_API_KEY) {
      console.log('ERROR: Steam API key not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Steam API key not configured',
          hint: 'Add STEAM_API_KEY to your environment variables'
        })
      };
    }

    const { queryStringParameters } = event;
    const { endpoint, steamid, appid, count = '10' } = queryStringParameters || {};
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Steam API: Processing ${endpoint} request`);
    }
    
    const targetSteamId = steamid || STEAM_ID;
    
    if (!targetSteamId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Steam ID required',
          hint: 'Provide steamid parameter or set STEAM_ID environment variable'
        })
      };
    }

    let steamUrl;
    let cacheTime = 300;

    switch (endpoint) {
      case 'profile':
      case 'player':
        steamUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${targetSteamId}`;
        cacheTime = 1800;
        break;
        
      case 'games':
      case 'library':
        steamUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${targetSteamId}&format=json&include_appinfo=true&include_played_free_games=true`;
        cacheTime = 3600;
        break;
        
      case 'recent':
      case 'recentgames':
        steamUrl = `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${STEAM_API_KEY}&steamid=${targetSteamId}&count=${count}`;
        cacheTime = 600;
        break;
        
      case 'level':
        steamUrl = `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${STEAM_API_KEY}&steamid=${targetSteamId}`;
        cacheTime = 86400;
        break;

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Invalid endpoint',
            availableEndpoints: ['profile', 'games', 'recent', 'level'],
            examples: {
              profile: `/.netlify/functions/steam-proxy?endpoint=profile`,
              recent: `/.netlify/functions/steam-proxy?endpoint=recent`
            }
          })
        };
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Steam API: Fetching data from Steam Web API`);
    }
    
    const response = await fetch(steamUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('ERROR: Steam API error response:', errorText);
      throw new Error(`Steam API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (process.env.NODE_ENV === 'development') {
      console.log(`Steam API: Successfully fetched ${endpoint} data`);
    }

    const enrichedData = {
      ...data,
      _metadata: {
        endpoint: endpoint,
        steamId: targetSteamId,
        timestamp: new Date().toISOString(),
        source: 'Steam Web API'
      }
    };

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Cache-Control': `public, max-age=${cacheTime}`
      },
      body: JSON.stringify(enrichedData)
    };

  } catch (error) {
    console.error('Steam proxy error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Steam API proxy error',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};