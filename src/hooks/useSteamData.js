import { useState, useEffect, useCallback } from 'react';

const CACHE_KEY_PREFIX = 'steam_cache_';
const CACHE_TTL = 5 * 60 * 1000;

const getCacheKey = (endpoint) => `${CACHE_KEY_PREFIX}${endpoint}`;

const getCachedData = (endpoint) => {
  try {
    const cached = localStorage.getItem(getCacheKey(endpoint));
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    if (now - timestamp > CACHE_TTL) {
      localStorage.removeItem(getCacheKey(endpoint));
      return null;
    }

    return data;
  } catch (err) {
    console.warn('Error reading from cache:', err);
    return null;
  }
};

const setCachedData = (endpoint, data) => {
  try {
    const cacheEntry = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(getCacheKey(endpoint), JSON.stringify(cacheEntry));
  } catch (err) {
    console.warn('Error writing to cache:', err);
  }
};

const clearAllSteamCache = () => {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (err) {
    console.warn('Error clearing cache:', err);
  }
};

export const useSteamData = (endpoints = ['profile', 'recent'], _options = {}) => {
  const [steamData, setSteamData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingCache, setUsingCache] = useState(false);

  const endpointsKey = endpoints.join(',');

  const refetchData = useCallback(() => {}, []);

  useEffect(() => {
    let mounted = true;

    const doFetch = async () => {
      if (!mounted) return;

      try {
        setLoading(true);
        setError(null);
        setUsingCache(false);

        const cachedResponses = endpoints.map(endpoint => {
          const cached = getCachedData(endpoint);
          return cached ? { endpoint, data: cached, success: true, fromCache: true } : null;
        }).filter(Boolean);

        if (cachedResponses.length === endpoints.length) {
          const newSteamData = {};
          let hasAnyData = false;

          cachedResponses.forEach(({ endpoint, data, success }) => {
            if (success && data) {
              switch (endpoint) {
                case 'profile': {
                  const player = data.response?.players?.[0];
                  newSteamData.profile = player || null;
                  if (data.response) hasAnyData = true;
                  break;
                }
                case 'recent': {
                  const games = data.response?.games || [];
                  newSteamData.recentGames = games;
                  if (data.response) hasAnyData = true;
                  break;
                }
                case 'games': {
                  const gameLibrary = data.response?.games || [];
                  newSteamData.gameLibrary = gameLibrary;
                  if (gameLibrary.length > 0) hasAnyData = true;
                  break;
                }
                case 'level': {
                  const level = data.response?.player_level;
                  newSteamData.level = level || null;
                  if (level) hasAnyData = true;
                  break;
                }
                default:
                  newSteamData[endpoint] = data;
                  hasAnyData = true;
              }
            }
          });

          if (mounted && hasAnyData) {
            setSteamData(newSteamData);
            setUsingCache(true);
            setLoading(false);
            setError(null);
          }
        }

        const responses = await Promise.all(
          endpoints.map(async (endpoint) => {
            try {
              const url = `/.netlify/functions/steam-proxy?endpoint=${endpoint}`;
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 10000);

              const response = await fetch(url, { signal: controller.signal });
              clearTimeout(timeout);

              if (!response.ok) {
                const errorText = await response.text();
                return { endpoint, data: null, success: false, error: `${response.status}: ${errorText.substring(0, 100)}` };
              }

              const contentType = response.headers.get('content-type');
              if (!contentType || !contentType.includes('application/json')) {
                const responseText = await response.text();
                return { endpoint, data: null, success: false, error: `Non-JSON response: ${responseText.substring(0, 100)}` };
              }

              const data = await response.json();
              setCachedData(endpoint, data);
              return { endpoint, data, success: true };

            } catch (fetchError) {
              const cached = getCachedData(endpoint);
              if (cached) {
                return { endpoint, data: cached, success: true, fromCache: true };
              }
              return { endpoint, data: null, success: false, error: fetchError.message };
            }
          })
        );

        const newSteamData = {};
        let hasAnyData = false;

        responses.forEach(({ endpoint, data, success }) => {
          if (success && data) {
            switch (endpoint) {
              case 'profile': {
                const player = data.response?.players?.[0];
                newSteamData.profile = player || null;
                if (data.response) {
                  hasAnyData = true;
                }
                break;
              }
              case 'recent': {
                const games = data.response?.games || [];
                newSteamData.recentGames = games;
                if (data.response) {
                  hasAnyData = true;
                }
                break;
              }
              case 'games': {
                const gameLibrary = data.response?.games || [];
                newSteamData.gameLibrary = gameLibrary;
                if (gameLibrary.length > 0) {
                  hasAnyData = true;
                }
                break;
              }
              case 'level': {
                const level = data.response?.player_level;
                newSteamData.level = level || null;
                if (level) {
                  hasAnyData = true;
                }
                break;
              }
              default:
                newSteamData[endpoint] = data;
                hasAnyData = true;
            }
          }
        });

        if (!mounted) return;

        if (hasAnyData) {
          setSteamData(newSteamData);
          setUsingCache(false);
          setError(null);
        } else {
          if (!usingCache) {
            setError('No Steam data received from any endpoint');
          }
        }

      } catch (err) {
        if (mounted) {
          if (!usingCache) {
            setError(`Steam data fetch failed: ${err.message}`);
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    doFetch();

    return () => {
      mounted = false;
    };
  }, [endpointsKey]);

  const getStats = () => {
    if (!steamData.gameLibrary) return null;

    const totalGames = steamData.gameLibrary.length;
    const totalPlaytime = steamData.gameLibrary.reduce((acc, game) => acc + (game.playtime_forever || 0), 0);
    const recentPlaytime = (steamData.recentGames || []).reduce((acc, game) => acc + (game.playtime_2weeks || 0), 0);

    return {
      totalGames,
      totalPlaytimeHours: Math.round(totalPlaytime / 60),
      recentPlaytimeHours: Math.round(recentPlaytime / 60),
      averagePerGame: totalGames > 0 ? Math.round(totalPlaytime / 60 / totalGames) : 0,
      topGames: [...steamData.gameLibrary]
        .sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0))
        .slice(0, 10)
    };
  };

  const formatPlaytime = (minutes) => {
    if (!minutes) return '0h';
    const hours = Math.round(minutes / 60 * 10) / 10;
    return hours < 1 ? `${minutes}m` : `${hours}h`;
  };

  const isOnline = () => {
    return steamData.profile?.personastate === 1;
  };

  const getCurrentGame = () => {
    return steamData.recentGames?.[0] || null;
  };

  return {
    steamData,
    loading,
    error,
    usingCache,
    getStats,
    formatPlaytime,
    isOnline,
    getCurrentGame,
    refetch: refetchData,
    clearCache: clearAllSteamCache,
    hasProfile: !!steamData.profile,
    hasRecentGames: !!(steamData.recentGames?.length),
    hasGameLibrary: !!(steamData.gameLibrary?.length)
  };
};

export default useSteamData;
