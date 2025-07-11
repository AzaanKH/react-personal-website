import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useSteamData } from '../hooks/useSteamData';

const SteamBentoCard = ({ isHovered, onHover, onHoverEnd }) => {
  const { isDarkMode } = useTheme();
  const [currentGame, setCurrentGame] = useState(null);

  // Use the Steam data hook - NO DEBUG
  const { 
    steamData, 
    loading, 
    error, 
    hasProfile,
    hasRecentGames,
    formatPlaytime
  } = useSteamData(['profile', 'recent'], { 
    enableDebug: false,
    autoRefresh: false 
  });

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

  // Error state - CLEAN (no debug info)
  if (error || !hasProfile) {
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

  return (
    <div className="p-4">
      {/* Header with Steam info */}
      <div className="d-flex align-items-center mb-3">
        <motion.div 
          className="me-3 position-relative"
          animate={isHovered ? {
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.img
            src={player.avatar}
            alt="Steam Avatar"
            className="rounded-circle"
            style={{ width: '48px', height: '48px' }}
            whileHover={{ scale: 1.2, rotate: 360 }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="position-absolute bottom-0 end-0"
            style={{
              width: '16px',
              height: '16px',
              background: player.personastate === 1 ? '#4caf50' : '#9e9e9e',
              border: '2px solid white',
              borderRadius: '50%'
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

        <motion.a
          href={player.profileurl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-info btn-sm"
          whileHover={{ 
            scale: 1.05,
            boxShadow: '0 4px 10px rgba(23, 162, 184, 0.3)'
          }}
          whileTap={{ scale: 0.95 }}
        >
          <i className="fab fa-steam"></i>
        </motion.a>
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
                alt={currentGame.name}
                className="rounded me-3"
                style={{ width: '40px', height: '40px' }}
                whileHover={{ rotate: 10, scale: 1.1 }}
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
            {steamData.recentGames?.slice(0, 3).map((game, index) => (
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