# Steam API Integration Tests

This directory contains comprehensive tests for the Steam API integration to ensure it works correctly during development and before deployment.

## 🚀 Quick Start

### Test Steam API in Development

```bash
# Start development server and run tests automatically
npm run dev:full

# Or test Steam API against running dev server
npm run test:steam:dev

# Or use the visual test dashboard
# Open http://localhost:8888/steam-test.html
```

### Test Steam API for Production

```bash
# Test against production deployment
npm run test:steam

# Test with custom URL
TEST_BASE_URL=https://your-site.com npm run test:steam
```

## 📋 Test Suite

The test suite validates:

1. **Environment Variables** - Ensures STEAM_API_KEY and STEAM_ID are loaded
2. **Function Accessibility** - Verifies Netlify functions are reachable
3. **Profile Endpoint** - Tests Steam profile data retrieval
4. **Recent Games Endpoint** - Tests recent games data
5. **Invalid Endpoint Handling** - Ensures proper error responses
6. **Response Caching** - Validates cache headers are set

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
STEAM_API_KEY=your_steam_api_key_here
STEAM_ID=your_steam_id_here
```

### GitHub Actions

The tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual workflow dispatch

Add these secrets to your GitHub repository:
- `STEAM_API_KEY`
- `STEAM_ID`

## 📊 Test Dashboard

A visual test dashboard is available at `/steam-test.html` when running the development server. This provides:

- Interactive testing of individual endpoints
- Real-time results with detailed error messages
- Performance metrics (response times)
- Formatted JSON responses
- Test summary and pass/fail statistics

## 🛠 Files Overview

```
tests/steam-api/
├── README.md                 # This file
├── steam-api.test.js        # Main test suite
└── run-tests.js             # Test runner script

public/
└── steam-test.html          # Visual test dashboard

.github/workflows/
└── steam-api-tests.yml      # GitHub Actions workflow
```

## 💡 Usage Examples

### During Development

```bash
# Full development setup with automatic testing
npm run dev:full

# Manual testing after making changes
npm run test:steam:dev
```

### Before Deployment

```bash
# Run tests as part of build process (automatic)
npm run build

# Skip tests if needed (not recommended)
npm run build:skip-tests
```

### Manual Testing

```bash
# Run tests against specific URL
TEST_BASE_URL=https://my-site.netlify.app npm run test:steam

# Run with debugging
DEBUG=1 npm run test:steam:dev
```

## 🐛 Troubleshooting

### Common Issues

1. **"Missing required environment variable"**
   - Ensure `.env` file exists with `STEAM_API_KEY` and `STEAM_ID`
   - Check that environment variables are loaded in netlify dev

2. **"Function not accessible"**
   - Verify `netlify dev` is running on port 8888
   - Check that `.cjs` function files exist in `netlify/functions/`

3. **"Steam API returned 403"**
   - Verify Steam API key is valid and not expired
   - Check Steam Web API key permissions

4. **"No player data returned"**
   - Ensure Steam profile is set to public
   - Verify Steam ID is correct (use 64-bit Steam ID)

### Debug Mode

Enable detailed logging:

```bash
DEBUG=1 npm run test:steam:dev
```

This provides additional console output for troubleshooting.

## 🔒 Security Notes

- Environment variables are never logged or exposed
- Steam API keys are only used server-side in Netlify functions
- Test results may contain Steam profile data - ensure this is acceptable for your use case

## 📈 CI/CD Integration

The test suite integrates with your build process:

- ✅ **Build Success**: All tests pass → deployment proceeds
- ❌ **Build Failure**: Tests fail → deployment is blocked
- ⚠️ **Build Warning**: Tests skipped → deployment proceeds with warning

This ensures Steam API integration is always working before deploying to production.