import { useState, useEffect, useCallback, useMemo } from 'react';

const CACHE_KEY_PREFIX = 'steam_cache_';
const REQUEST_TIMEOUT_MS = 10000;

// Client cache lifetimes mirror the proxy's Cache-Control (netlify/lib/steam.js).
// Profile carries online / "now playing" state, so it stays short.
const CACHE_TTL = {
  profile: 60 * 1000,
  recent: 10 * 60 * 1000,
  games: 60 * 60 * 1000,
  level: 24 * 60 * 60 * 1000,
};
const DEFAULT_TTL = 5 * 60 * 1000;

const getCacheKey = (endpoint) => `${CACHE_KEY_PREFIX}${endpoint}`;

// When the proxy actually queried Steam. A CDN hit replays the original value, so
// this (not the time the browser received the response) is how old the data is.
export const getServerTimestamp = (data) => {
  const parsed = Date.parse(data?._metadata?.timestamp);
  return Number.isNaN(parsed) ? Date.now() : Math.min(parsed, Date.now());
};

const getCachedEntry = (endpoint) => {
  try {
    const cached = localStorage.getItem(getCacheKey(endpoint));
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > (CACHE_TTL[endpoint] ?? DEFAULT_TTL)) {
      localStorage.removeItem(getCacheKey(endpoint));
      return null;
    }
    return { data, timestamp };
  } catch {
    return null;
  }
};

const setCachedData = (endpoint, data) => {
  try {
    localStorage.setItem(getCacheKey(endpoint), JSON.stringify({ data, timestamp: getServerTimestamp(data) }));
  } catch {
    // Storage full or unavailable: data still renders, it just won't be cached.
  }
};

const clearAllSteamCache = () => {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(CACHE_KEY_PREFIX)) localStorage.removeItem(key);
    });
  } catch {
    // Nothing to clear.
  }
};

// Maps a raw proxy response to the key/value it contributes to `steamData`.
export function normalizeSteamResponse(endpoint, data) {
  const response = data?.response;
  switch (endpoint) {
    case 'profile':
      return ['profile', response?.players?.[0] ?? null];
    case 'recent':
      return ['recentGames', response?.games ?? []];
    case 'games':
      return ['gameLibrary', response?.games ?? []];
    case 'level':
      return ['level', response?.player_level ?? null];
    default:
      return [endpoint, data];
  }
}

// A manual refresh adds a unique `refresh` param. `cache: 'reload'` only skips the
// browser cache, but the param is part of Netlify's CDN cache key, so it also
// guarantees a trip to Steam (see netlify/lib/steam.js).
export function buildSteamRequestUrl(endpoint, refreshNonce) {
  const params = new URLSearchParams({ endpoint });
  if (refreshNonce) params.set('refresh', String(refreshNonce));
  return `/api/steam?${params}`;
}

async function fetchEndpoint(endpoint, { signal, refreshNonce }) {
  const response = await fetch(buildSteamRequestUrl(endpoint, refreshNonce), {
    signal: AbortSignal.any([signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]),
    cache: refreshNonce ? 'no-store' : 'default',
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Unexpected response from the Steam proxy');
  }
  return response.json();
}

function readInitialState(endpointList) {
  const steamData = {};
  const fetchedAt = {};
  let complete = true;

  for (const endpoint of endpointList) {
    const entry = getCachedEntry(endpoint);
    if (!entry) {
      complete = false;
      continue;
    }
    const [key, value] = normalizeSteamResponse(endpoint, entry.data);
    steamData[key] = value;
    fetchedAt[endpoint] = entry.timestamp;
  }

  return { steamData, fetchedAt, complete };
}

// "Updated" reflects the stalest data on screen, so it never claims more freshness than it has.
const oldestTimestamp = (fetchedAt) => {
  const times = Object.values(fetchedAt);
  return times.length > 0 ? Math.min(...times) : null;
};

export const useSteamData = (endpoints = ['profile', 'recent']) => {
  const endpointsKey = endpoints.join(',');
  const endpointList = useMemo(() => endpointsKey.split(',').filter(Boolean), [endpointsKey]);

  const [initial] = useState(() => readInitialState(endpointList));
  const [steamData, setSteamData] = useState(initial.steamData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(!initial.complete);
  const [refreshing, setRefreshing] = useState(false);
  const [usingCache, setUsingCache] = useState(initial.complete);
  const [fetchedAt, setFetchedAt] = useState(initial.fetchedAt);
  // 0 = initial load; otherwise a unique nonce per Refresh click.
  const [refreshNonce, setRefreshNonce] = useState(0);

  useEffect(() => {
    // Fresh cache for every endpoint on mount: render it without a network round trip.
    // (Derived from state rather than a ref so StrictMode's double effect run agrees.)
    if (refreshNonce === 0 && initial.complete) return;

    const controller = new AbortController();

    Promise.allSettled(
      endpointList.map((endpoint) => fetchEndpoint(endpoint, { signal: controller.signal, refreshNonce })),
    ).then((results) => {
      if (controller.signal.aborted) return;

      const updates = {};
      const updatedAt = {};
      const nextErrors = {};
      results.forEach((result, index) => {
        const endpoint = endpointList[index];
        if (result.status === 'fulfilled') {
          setCachedData(endpoint, result.value);
          const [key, value] = normalizeSteamResponse(endpoint, result.value);
          updates[key] = value;
          updatedAt[endpoint] = getServerTimestamp(result.value);
        } else {
          nextErrors[endpoint] = result.reason?.name === 'TimeoutError'
            ? 'Request timed out'
            : result.reason?.message || 'Request failed';
        }
      });

      // Failed endpoints keep whatever was shown before rather than blanking out.
      setSteamData((prev) => ({ ...prev, ...updates }));
      setFetchedAt((prev) => ({ ...prev, ...updatedAt }));
      setErrors(nextErrors);
      if (Object.keys(updates).length > 0) setUsingCache(false);
      setLoading(false);
      setRefreshing(false);
    });

    return () => controller.abort();
  }, [endpointList, refreshNonce, initial.complete]);

  const refetch = useCallback(() => {
    setRefreshing(true);
    // Strictly increasing, so two clicks in the same millisecond still differ.
    setRefreshNonce((previous) => Math.max(Date.now(), previous + 1));
  }, []);

  const failedEndpoints = Object.keys(errors);
  const hasAnyData = Object.values(steamData).some((value) =>
    Array.isArray(value) ? value.length > 0 : value != null,
  );
  const error = failedEndpoints.length === endpointList.length && !hasAnyData
    ? 'Steam data is unavailable right now.'
    : null;

  const formatPlaytime = (minutes) => {
    if (!minutes) return '0h';
    const hours = Math.round((minutes / 60) * 10) / 10;
    return hours < 1 ? `${minutes}m` : `${hours}h`;
  };

  return {
    steamData,
    loading,
    refreshing,
    error,
    errors,
    partialFailure: failedEndpoints.length > 0 && !error,
    usingCache,
    lastUpdated: oldestTimestamp(fetchedAt),
    refetch,
    formatPlaytime,
    isOnline: () => steamData.profile?.personastate === 1,
    getCurrentGame: () => steamData.recentGames?.[0] || null,
    clearCache: clearAllSteamCache,
    hasProfile: !!steamData.profile,
    hasRecentGames: !!steamData.recentGames?.length,
    hasGameLibrary: !!steamData.gameLibrary?.length,
  };
};

export default useSteamData;
