import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useSteamData } from '../hooks/useSteamData';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Gamepad2, ExternalLink } from 'lucide-react';

const SteamBentoCard = ({ isHovered, onHover: _onHover, onHoverEnd: _onHoverEnd }) => {
  const { isDarkMode } = useTheme();
  const [currentGame, setCurrentGame] = useState(null);

  // Memoize the endpoints and options to prevent unnecessary re-renders
  const steamEndpoints = useMemo(() => ['profile', 'recent'], []);
  const steamOptions = useMemo(() => ({ 
    enableDebug: false,
    autoRefresh: false 
  }), []);

  // Use the Steam data hook - NO DEBUG
  const { 
    steamData, 
    loading, 
    error, 
    hasProfile,
    hasRecentGames: _hasRecentGames,
    formatPlaytime
  } = useSteamData(steamEndpoints, steamOptions);

  // Set initial current game when Steam data loads
  useEffect(() => {
    if (steamData.recentGames?.length > 0 && !currentGame) {
      setCurrentGame(steamData.recentGames[0]);
    }
  }, [steamData.recentGames, currentGame]);

  // Cycle through recent games
  useEffect(() => {
    if (steamData.recentGames?.length > 1) {
      const interval = setInterval(() => {
        setCurrentGame(prev => {
          const currentIndex = steamData.recentGames.findIndex(game => game.appid === prev?.appid);
          const nextIndex = (currentIndex + 1) % steamData.recentGames.length;
          const nextGame = steamData.recentGames[nextIndex];
          return nextGame;
        });
      }, 4000); // Cycle every 4 seconds

      return () => clearInterval(interval);
    }
  }, [steamData.recentGames]);

  // Loading state - CLEAN
  if (loading) {
    return (
      <div className="p-4 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-2"
        >
          <i className="fab fa-steam text-info" style={{ fontSize: '2rem' }}></i>
        </motion.div>
        <small className="text-muted d-block">Loading Steam data...</small>
      </div>
    );
  }

  // Debug logging removed for production
  // Uncomment below for debugging if needed:
  // console.log('🔍 SteamBentoCard Render:', {
  //   loading,
  //   error,
  //   hasProfile,
  //   steamDataKeys: Object.keys(steamData),
  //   profileExists: !!steamData.profile,
  //   recentGamesCount: steamData.recentGames?.length || 0,
  //   timestamp: new Date().toISOString()
  // });

  // Only show error state if we have an error AND no profile data at all
  // This prevents flickering when data is temporarily unavailable
  if (error && !hasProfile && !loading) {
    return (
      <div className="p-4">
        <div className="d-flex align-items-center mb-3">
          <motion.div 
            className="me-3"
            animate={isHovered ? {
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1, 1.1, 1]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <i className="fas fa-gamepad text-warning" style={{ fontSize: '2rem' }}></i>
          </motion.div>
          <h5 className="mb-0">Gaming Profile</h5>
        </div>
        
        <motion.p 
          className="mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <strong>Currently Playing:</strong> 
          <motion.span
            className="ms-1"
            animate={{
              color: ['#ffc107', '#ff6b6b', '#4ecdc4', '#45b7d1', '#ffc107']
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Elden Ring
          </motion.span>
        </motion.p>
        
        <small className="text-muted d-block">
          Gaming helps me unwind while staying engaged with complex problem-solving.
        </small>
        
        
      </div>
    );
  }

  const { profile: player } = steamData;

  // If we don't have profile data yet, show loading or wait
  if (!player) {
    return (
      <div className="p-4 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-2"
        >
          <i className="fab fa-steam text-info" style={{ fontSize: '2rem' }}></i>
        </motion.div>
        <small className="text-muted d-block">Loading Steam profile...</small>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header with Steam info */}
      <div className="d-flex align-items-center mb-3">
        <motion.div
          className="mr-3 relative"
          animate={isHovered ? {
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Avatar className="w-12 h-12 border-2 border-border">
            <AvatarImage
              src={player.avatar}
              alt={`${player.personaname}'s Steam avatar`}
              className="object-cover"
            />
            <AvatarFallback className="bg-cyan-500/20 text-cyan-500">
              <Gamepad2 className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
          <motion.div
            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background"
            style={{
              background: player.personastate === 1 ? '#4caf50' : '#9e9e9e',
            }}
            animate={{
              scale: player.personastate === 1 ? [1, 1.2, 1] : 1
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        
        <div className="flex-grow-1">
          <motion.h5 
            className="mb-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Steam Gaming
          </motion.h5>
          <motion.small 
            className="text-muted d-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {player.personaname}
          </motion.small>
        </div>

        <Button
          variant="outline"
          size="sm"
          asChild
          className="hover:bg-cyan-500/20 hover:border-cyan-500 hover:text-cyan-500 transition-colors"
        >
          <motion.a
            href={player.profileurl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ExternalLink className="w-4 h-4" />
          </motion.a>
        </Button>
      </div>

      {/* Current Game Display */}
      <AnimatePresence mode="wait">
        {currentGame && (
          <motion.div
            key={currentGame.appid}
            className="current-game p-3 rounded"
            style={{
              background: isDarkMode 
                ? 'linear-gradient(135deg, rgba(23, 162, 184, 0.1), rgba(23, 162, 184, 0.05))'
                : 'linear-gradient(135deg, rgba(23, 162, 184, 0.05), rgba(23, 162, 184, 0.02))',
              border: `1px solid ${isDarkMode ? 'rgba(23, 162, 184, 0.2)' : 'rgba(23, 162, 184, 0.1)'}`
            }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <div className="d-flex align-items-center">
              <motion.img
                src={`https://media.steampowered.com/steamcommunity/public/images/apps/${currentGame.appid}/${currentGame.img_icon_url}.jpg`}
                alt={`${currentGame.name} game icon`}
                className="rounded me-3"
                style={{ width: '40px', height: '40px' }}
                whileHover={{ rotate: 10, scale: 1.1 }}
                loading="lazy"
                onError={(e) => {
                  // Fallback to a default game icon
                  e.target.src = `data:image/svg+xml,${encodeURIComponent(`
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="40" height="40" fill="#333" rx="4"/>
                      <path d="M20 12L28 20L20 28L12 20L20 12Z" fill="#fff" opacity="0.7"/>
                    </svg>
                  `)}`;
                }}
              />
              <div className="flex-grow-1">
                <motion.div 
                  className="fw-medium"
                  style={{ fontSize: '0.9rem' }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {currentGame.name.length > 22 
                    ? currentGame.name.substring(0, 22) + '...' 
                    : currentGame.name}
                </motion.div>
                <motion.small 
                  className="text-muted d-block"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {formatPlaytime(currentGame.playtime_2weeks)} recent
                  {currentGame.playtime_forever && (
                    <span className="ms-2">
                      • {formatPlaytime(currentGame.playtime_forever)} total
                    </span>
                  )}
                </motion.small>
              </div>
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <i className="fas fa-gamepad text-info"></i>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game cycling indicator */}
      {steamData.recentGames?.length > 1 && (
        <motion.div 
          className="text-center mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="d-flex justify-content-center gap-1">
            {steamData.recentGames?.slice(0, 3).map((game, _index) => (
              <motion.div
                key={game.appid}
                className="rounded-circle"
                style={{
                  width: '6px',
                  height: '6px',
                  background: currentGame?.appid === game.appid 
                    ? '#17a2b8' 
                    : isDarkMode ? '#555' : '#ccc'
                }}
                animate={currentGame?.appid === game.appid ? {
                  scale: [1, 1.3, 1]
                } : {}}
                transition={{ duration: 0.5 }}
              />
            ))}
          </div>
          <small className="text-muted mt-1 d-block" style={{ fontSize: '0.7rem' }}>
            Recent games • {steamData.recentGames?.length || 0} total
          </small>
        </motion.div>
      )}
    </div>
  );
};

export default SteamBentoCard;