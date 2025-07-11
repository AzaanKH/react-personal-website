import { useState, useEffect } from 'react';

export const useSteamData = (endpoints = ['profile', 'recent'], options = {}) => {
  const [steamData, setSteamData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { 
    autoRefresh = false, 
    refreshInterval = 300000, // 5 minutes
    enableDebug = false // Always disabled for production
  } = options;

  const fetchSteamData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Steam data from endpoints
      const responses = await Promise.all(
        endpoints.map(async (endpoint) => {
          try {
            const url = `/.netlify/functions/steam-proxy?endpoint=${endpoint}`;
            const response = await fetch(url);
            
            if (!response.ok) {
              const errorText = await response.text();
              return { endpoint, data: null, success: false, error: `${response.status}: ${errorText.substring(0, 100)}` };
            }
            
            // Check if response is actually JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              const responseText = await response.text();
              return { endpoint, data: null, success: false, error: `Non-JSON response: ${responseText.substring(0, 100)}` };
            }
            
            const data = await response.json();
            return { endpoint, data, success: true };
            
          } catch (fetchError) {
            return { endpoint, data: null, success: false, error: fetchError.message };
          }
        })
      );

      // Process responses
      const newSteamData = {};
      let hasAnyData = false;

      responses.forEach(({ endpoint, data, success, error }) => {
        if (success && data) {
          switch (endpoint) {
            case 'profile':
              const player = data.response?.players?.[0];
              newSteamData.profile = player || null;
              if (player) {
                hasAnyData = true;
              }
              break;
              
            case 'recent':
              const games = data.response?.games || [];
              newSteamData.recentGames = games;
              if (games.length > 0) {
                hasAnyData = true;
              }
              break;
              
            case 'games':
              const gameLibrary = data.response?.games || [];
              newSteamData.gameLibrary = gameLibrary;
              if (gameLibrary.length > 0) {
                hasAnyData = true;
              }
              break;
              
            case 'level':
              const level = data.response?.player_level;
              newSteamData.level = level || null;
              if (level) {
                hasAnyData = true;
              }
              break;
              
            default:
              newSteamData[endpoint] = data;
              hasAnyData = true;
          }
        }
      });

      if (hasAnyData) {
        setSteamData(newSteamData);
      } else {
        const errorMessage = `No Steam data received from any endpoint`;
        throw new Error(errorMessage);
      }

    } catch (err) {
      const errorMessage = `Steam data fetch failed: ${err.message}`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSteamData();
  }, [endpoints.join(',')]); // Re-fetch if endpoints change

  // Auto-refresh if enabled
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchSteamData, refreshInterval);
      return () => {
        clearInterval(interval);
      };
    }
  }, [autoRefresh, refreshInterval]);

  // Helper functions
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
    // Data
    steamData,
    loading,
    error,
    
    // Helper functions
    getStats,
    formatPlaytime,
    isOnline,
    getCurrentGame,
    
    // Actions
    refetch: fetchSteamData,
    
    // Computed values
    hasProfile: !!steamData.profile,
    hasRecentGames: !!(steamData.recentGames?.length),
    hasGameLibrary: !!(steamData.gameLibrary?.length)
  };
};

export default useSteamData;