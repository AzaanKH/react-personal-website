import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const SteamStatsDashboard = () => {
  const { isDarkMode } = useTheme();
  const [steamData, setSteamData] = useState({
    profile: null,
    recentGames: [],
    gameLibrary: [],
    level: null
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllSteamData = async () => {
      try {
        setLoading(true);
        
        // Fetch all Steam data in parallel
        const endpoints = [
          { key: 'profile', endpoint: 'profile' },
          { key: 'recentGames', endpoint: 'recent' },
          { key: 'gameLibrary', endpoint: 'games' },
          { key: 'level', endpoint: 'level' }
        ];

        const responses = await Promise.all(
          endpoints.map(async ({ key, endpoint }) => {
            try {
              const response = await fetch(`/.netlify/functions/steam-proxy?endpoint=${endpoint}`);
              if (response.ok) {
                const data = await response.json();
                return { key, data, success: true };
              }
              return { key, data: null, success: false };
            } catch (error) {
              console.error(`Error fetching ${endpoint}:`, error);
              return { key, data: null, success: false };
            }
          })
        );

        // Process responses
        const newSteamData = { ...steamData };
        responses.forEach(({ key, data, success }) => {
          if (success && data) {
            switch (key) {
              case 'profile':
                newSteamData.profile = data.response?.players?.[0];
                break;
              case 'recentGames':
                newSteamData.recentGames = data.response?.games || [];
                break;
              case 'gameLibrary':
                newSteamData.gameLibrary = data.response?.games || [];
                break;
              case 'level':
                newSteamData.level = data.response?.player_level;
                break;
            }
          }
        });

        setSteamData(newSteamData);
      } catch (error) {
        console.error('Steam dashboard error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllSteamData();
  }, []);

  // Calculate stats
  const getStats = () => {
    const totalGames = steamData.gameLibrary.length;
    const totalPlaytime = steamData.gameLibrary.reduce((acc, game) => acc + (game.playtime_forever || 0), 0);
    const recentPlaytime = steamData.recentGames.reduce((acc, game) => acc + (game.playtime_2weeks || 0), 0);
    
    const topGames = [...steamData.gameLibrary]
      .sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0))
      .slice(0, 5);

    return {
      totalGames,
      totalPlaytime: Math.round(totalPlaytime / 60), // Convert to hours
      recentPlaytime: Math.round(recentPlaytime / 60),
      topGames,
      averagePerGame: totalGames > 0 ? Math.round(totalPlaytime / 60 / totalGames) : 0
    };
  };

  const formatHours = (hours) => {
    if (hours < 1) return '<1h';
    if (hours < 100) return `${hours}h`;
    return `${Math.round(hours / 10) / 10}k hrs`;
  };

  const stats = getStats();

  if (loading) {
    return (
      <motion.div 
        className="steam-dashboard p-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-3"
        >
          <i className="fab fa-steam text-info" style={{ fontSize: '4rem' }}></i>
        </motion.div>
        <h4>Loading Steam Dashboard</h4>
        <p className="text-muted">Gathering your gaming statistics...</p>
      </motion.div>
    );
  }

  if (error || !steamData.profile) {
    return (
      <motion.div 
        className="steam-dashboard p-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <i className="fas fa-exclamation-triangle text-warning mb-3" style={{ fontSize: '3rem' }}></i>
        <h4>Steam Dashboard Unavailable</h4>
        <p className="text-muted">Unable to load Steam statistics at the moment.</p>
        <small className="text-muted">This could be due to API configuration or network issues.</small>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="steam-dashboard"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, rgba(23, 23, 29, 0.95), rgba(37, 38, 43, 0.95))'
          : 'linear-gradient(135deg, rgba(248, 249, 250, 0.95), rgba(255, 255, 255, 0.95))',
        borderRadius: '20px',
        border: `1px solid ${isDarkMode ? '#2C2E33' : '#dee2e6'}`,
        boxShadow: isDarkMode 
          ? '0 12px 40px rgba(0,0,0,0.4)' 
          : '0 8px 30px rgba(0,0,0,0.15)',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div className="steam-header p-4 position-relative">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="d-flex align-items-center">
              <motion.img
                src={steamData.profile.avatarfull}
                alt="Steam Avatar"
                className="rounded-circle me-3"
                style={{ width: '80px', height: '80px' }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              <div>
                <motion.h3 
                  className="mb-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {steamData.profile.personaname}
                </motion.h3>
                <div className="d-flex align-items-center">
                  <motion.div
                    className="rounded-circle me-2"
                    style={{
                      width: '12px',
                      height: '12px',
                      background: steamData.profile.personastate === 1 ? '#4caf50' : '#9e9e9e'
                    }}
                    animate={steamData.profile.personastate === 1 ? {
                      scale: [1, 1.3, 1]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <small className="text-muted">
                    {steamData.profile.personastate === 1 ? 'Online' : 'Offline'}
                  </small>
                  {steamData.level && (
                    <span className="badge bg-info ms-3">
                      Level {steamData.level}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-6 text-md-end">
            <motion.a
              href={steamData.profile.profileurl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-info"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fab fa-steam me-2"></i>
              View Steam Profile
            </motion.a>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid p-4">
        <div className="row g-3">
          <div className="col-md-3 col-sm-6">
            <motion.div 
              className="stat-card text-center p-3 rounded"
              style={{
                background: isDarkMode ? 'rgba(34, 139, 230, 0.1)' : 'rgba(34, 139, 230, 0.05)',
                border: `1px solid ${isDarkMode ? 'rgba(34, 139, 230, 0.2)' : 'rgba(34, 139, 230, 0.1)'}`
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.i 
                className="fas fa-gamepad text-primary mb-2"
                style={{ fontSize: '2rem' }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              ></motion.i>
              <h4 className="mb-1">{stats.totalGames}</h4>
              <small className="text-muted">Games Owned</small>
            </motion.div>
          </div>

          <div className="col-md-3 col-sm-6">
            <motion.div 
              className="stat-card text-center p-3 rounded"
              style={{
                background: isDarkMode ? 'rgba(40, 192, 87, 0.1)' : 'rgba(40, 192, 87, 0.05)',
                border: `1px solid ${isDarkMode ? 'rgba(40, 192, 87, 0.2)' : 'rgba(40, 192, 87, 0.1)'}`
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.i 
                className="fas fa-clock text-success mb-2"
                style={{ fontSize: '2rem' }}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              ></motion.i>
              <h4 className="mb-1">{formatHours(stats.totalPlaytime)}</h4>
              <small className="text-muted">Total Playtime</small>
            </motion.div>
          </div>

          <div className="col-md-3 col-sm-6">
            <motion.div 
              className="stat-card text-center p-3 rounded"
              style={{
                background: isDarkMode ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 193, 7, 0.05)',
                border: `1px solid ${isDarkMode ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 193, 7, 0.1)'}`
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.i 
                className="fas fa-fire text-warning mb-2"
                style={{ fontSize: '2rem' }}
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotateY: [0, 180, 360]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              ></motion.i>
              <h4 className="mb-1">{formatHours(stats.recentPlaytime)}</h4>
              <small className="text-muted">Recent 2 Weeks</small>
            </motion.div>
          </div>

          <div className="col-md-3 col-sm-6">
            <motion.div 
              className="stat-card text-center p-3 rounded"
              style={{
                background: isDarkMode ? 'rgba(23, 162, 184, 0.1)' : 'rgba(23, 162, 184, 0.05)',
                border: `1px solid ${isDarkMode ? 'rgba(23, 162, 184, 0.2)' : 'rgba(23, 162, 184, 0.1)'}`
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.i 
                className="fas fa-chart-bar text-info mb-2"
                style={{ fontSize: '2rem' }}
                animate={{ 
                  scaleY: [1, 1.2, 0.8, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              ></motion.i>
              <h4 className="mb-1">{formatHours(stats.averagePerGame)}</h4>
              <small className="text-muted">Avg per Game</small>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Top Games */}
      {stats.topGames.length > 0 && (
        <div className="top-games p-4 pt-0">
          <motion.h5 
            className="mb-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <i className="fas fa-trophy text-warning me-2"></i>
            Most Played Games
          </motion.h5>
          
          <div className="row g-2">
            <AnimatePresence>
              {stats.topGames.map((game, index) => (
                <motion.div 
                  key={game.appid}
                  className="col-12"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + (index * 0.1) }}
                >
                  <motion.div 
                    className="top-game d-flex align-items-center p-3 rounded"
                    style={{
                      background: isDarkMode ? 'rgba(44, 46, 51, 0.5)' : 'rgba(248, 249, 250, 0.7)',
                      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                    }}
                    whileHover={{ 
                      scale: 1.02,
                      background: isDarkMode ? 'rgba(44, 46, 51, 0.8)' : 'rgba(248, 249, 250, 1)',
                    }}
                  >
                    <motion.div 
                      className="rank-badge me-3 text-center"
                      style={{
                        width: '30px',
                        height: '30px',
                        background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#17a2b8',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '0.8rem'
                      }}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {index + 1}
                    </motion.div>
                    
                    <motion.img
                      src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`}
                      alt={game.name}
                      className="rounded me-3"
                      style={{ width: '48px', height: '48px' }}
                      whileHover={{ rotate: 10 }}
                      onError={(e) => {
                        e.target.src = `data:image/svg+xml,${encodeURIComponent(`
                          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="48" height="48" fill="#333" rx="6"/>
                            <path d="M24 16L32 24L24 32L16 24L24 16Z" fill="#fff" opacity="0.7"/>
                          </svg>
                        `)}`;
                      }}
                    />
                    
                    <div className="flex-grow-1">
                      <div className="fw-medium">
                        {game.name.length > 30 ? game.name.substring(0, 30) + '...' : game.name}
                      </div>
                      <small className="text-muted">
                        {formatHours(Math.round((game.playtime_forever || 0) / 60))} played
                      </small>
                    </div>
                    
                    <motion.div
                      className="playtime-bar"
                      style={{
                        width: '60px',
                        height: '4px',
                        background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}
                    >
                      <motion.div
                        style={{
                          height: '100%',
                          background: `linear-gradient(90deg, 
                            ${index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#17a2b8'}, 
                            ${index === 0 ? '#ffed4e' : index === 1 ? '#e2e8f0' : index === 2 ? '#f7931e' : '#3498db'})`,
                          borderRadius: '2px'
                        }}
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${Math.min(100, (game.playtime_forever / stats.topGames[0].playtime_forever) * 100)}%` 
                        }}
                        transition={{ delay: 1 + (index * 0.1), duration: 1 }}
                      />
                    </motion.div>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {steamData.recentGames.length > 0 && (
        <div className="recent-activity p-4 pt-0">
          <motion.h5 
            className="mb-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
          >
            <i className="fas fa-clock text-info me-2"></i>
            Recent Activity
          </motion.h5>
          
          <div className="row g-2">
            {steamData.recentGames.slice(0, 3).map((game, index) => (
              <motion.div 
                key={game.appid}
                className="col-md-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + (index * 0.1) }}
              >
                <motion.div 
                  className="recent-game-card text-center p-3 rounded"
                  style={{
                    background: isDarkMode ? 'rgba(44, 46, 51, 0.3)' : 'rgba(248, 249, 250, 0.5)',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                  }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <motion.img
                    src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`}
                    alt={game.name}
                    className="rounded mb-2"
                    style={{ width: '64px', height: '64px' }}
                    whileHover={{ scale: 1.1 }}
                  />
                  <div className="fw-medium small">
                    {game.name.length > 15 ? game.name.substring(0, 15) + '...' : game.name}
                  </div>
                  <small className="text-muted d-block">
                    {formatHours(Math.round((game.playtime_2weeks || 0) / 60))} this week
                  </small>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SteamStatsDashboard;