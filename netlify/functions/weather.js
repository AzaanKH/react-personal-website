const WMO_CODES = {
  0: { condition: 'Clear', icon: 'sun', text: 'Sunny' },
  1: { condition: 'Clear', icon: 'sun', text: 'Mainly Clear' },
  2: { condition: 'Clouds', icon: 'cloud', text: 'Partly Cloudy' },
  3: { condition: 'Clouds', icon: 'cloud', text: 'Overcast' },
  45: { condition: 'Fog', icon: 'fog', text: 'Foggy' },
  48: { condition: 'Fog', icon: 'fog', text: 'Rime Fog' },
  51: { condition: 'Drizzle', icon: 'drizzle', text: 'Light Drizzle' },
  53: { condition: 'Drizzle', icon: 'drizzle', text: 'Drizzle' },
  55: { condition: 'Drizzle', icon: 'drizzle', text: 'Dense Drizzle' },
  56: { condition: 'Drizzle', icon: 'drizzle', text: 'Freezing Drizzle' },
  57: { condition: 'Drizzle', icon: 'drizzle', text: 'Freezing Drizzle' },
  61: { condition: 'Rain', icon: 'rain', text: 'Light Rain' },
  63: { condition: 'Rain', icon: 'rain', text: 'Rain' },
  65: { condition: 'Rain', icon: 'rain', text: 'Heavy Rain' },
  66: { condition: 'Rain', icon: 'rain', text: 'Freezing Rain' },
  67: { condition: 'Rain', icon: 'rain', text: 'Freezing Rain' },
  71: { condition: 'Snow', icon: 'snow', text: 'Light Snow' },
  73: { condition: 'Snow', icon: 'snow', text: 'Snow' },
  75: { condition: 'Snow', icon: 'snow', text: 'Heavy Snow' },
  77: { condition: 'Snow', icon: 'snow', text: 'Snow Grains' },
  80: { condition: 'Rain', icon: 'rain', text: 'Rain Showers' },
  81: { condition: 'Rain', icon: 'rain', text: 'Rain Showers' },
  82: { condition: 'Rain', icon: 'rain', text: 'Heavy Showers' },
  85: { condition: 'Snow', icon: 'snow', text: 'Snow Showers' },
  86: { condition: 'Snow', icon: 'snow', text: 'Heavy Snow Showers' },
  95: { condition: 'Thunderstorm', icon: 'thunderstorm', text: 'Thunderstorm' },
  96: { condition: 'Thunderstorm', icon: 'thunderstorm', text: 'Thunderstorm with Hail' },
  99: { condition: 'Thunderstorm', icon: 'thunderstorm', text: 'Thunderstorm with Hail' },
}

const FALLBACK = { condition: 'Clear', icon: 'sun', text: 'Unknown' }

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const url =
      'https://api.open-meteo.com/v1/forecast?latitude=47.61&longitude=-122.20&current=temperature_2m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FLos_Angeles'

    const res = await fetch(url)
    if (!res.ok) throw new Error(`Open-Meteo returned ${res.status}`)

    const data = await res.json()
    const { temperature_2m, weather_code } = data.current

    const mapped = WMO_CODES[weather_code] || FALLBACK

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Cache-Control': 'public, max-age=900',
      },
      body: JSON.stringify({
        temp: Math.round(temperature_2m),
        condition: mapped.condition,
        icon: mapped.icon,
        text: mapped.text,
      }),
    }
  } catch (error) {
    console.error('Weather function error:', error)

    return {
      statusCode: 502,
      headers: {
        ...headers,
        'Cache-Control': 'public, max-age=300',
      },
      body: JSON.stringify({
        temp: null,
        condition: null,
        icon: null,
        text: null,
        error: 'Weather data unavailable',
      }),
    }
  }
}
