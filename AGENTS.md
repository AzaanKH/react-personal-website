# Agent Instructions

## Local Development

Always use `netlify dev` to run the development server for this project. Do not use `npm run dev` as the primary local server.

```bash
netlify dev
```

`netlify dev` loads `.env`, starts Netlify Functions, and proxies the Vite app through:

```text
http://localhost:8888
```

Running `npm run dev` directly only starts Vite, so Netlify Functions for Steam API, weather, and rate limiting will not be available.
