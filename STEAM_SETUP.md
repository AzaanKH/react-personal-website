# Steam API Setup Guide

## Prerequisites

1. **Steam Web API Key**: Get your API key from [Steam Web API](https://steamcommunity.com/dev/apikey)
2. **Steam ID**: Find your Steam ID using [SteamID Finder](https://steamidfinder.com/) or Steam community profile

## Environment Configuration

### Step 1: Copy Environment File
```bash
cp .env.example .env
```

### Step 2: Add Steam Configuration
Edit your `.env` file and add:

```env
# Steam API Configuration
STEAM_API_KEY=your_steam_api_key_here
STEAM_ID=your_steam_id_here
```

### Step 3: Verify Configuration
The Steam API integration will:
- Show real game data when environment variables are properly configured
- Display a fallback gaming profile when variables are missing
- Show debug information in development mode if there are errors

## Testing with Netlify Dev

```bash
# Install dependencies
npm install

# Start Netlify development server
netlify dev
```

The Steam integration should now load your real gaming data from the Steam API.

## Troubleshooting

### Common Issues

1. **"Steam API key not configured" error**
   - Ensure `STEAM_API_KEY` is set in your `.env` file
   - Restart `netlify dev` after adding environment variables

2. **"Steam ID required" error**
   - Ensure `STEAM_ID` is set in your `.env` file
   - Use the 64-bit Steam ID format (17 digits)

3. **API rate limiting**
   - Steam API has rate limits per key
   - The proxy includes caching to minimize API calls

### Debug Mode

In development mode, error details are shown in the Gaming Profile card to help identify configuration issues.

## Privacy Note

The Steam API only accesses public profile information. Make sure your Steam profile is set to public if you want the integration to work.