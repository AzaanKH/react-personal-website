import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const handleScrollTo = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const navbarHeight = targetId === 'azaan-khalfe' ? 120 : 60;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  return (
    <motion.nav 
      className="navbar navbar-expand-lg navbar-light"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
    >
      <div className="container">
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <motion.li 
              className="nav-item"
              custom={0}
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
            >
              <a 
                className="nav-link" 
                href="#azaan-khalfe"
                onClick={(e) => handleScrollTo(e, 'azaan-khalfe')}
              >
                Home
              </a>
            </motion.li>
            <motion.li 
              className="nav-item"
              custom={1}
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
            >
              <a 
                className="nav-link" 
                href="#bio"
                onClick={(e) => handleScrollTo(e, 'bio')}
              >
                About
              </a>
            </motion.li>
            <motion.li 
              className="nav-item"
              custom={2}
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
            >
              <a 
                className="nav-link" 
                href="#projects"
                onClick={(e) => handleScrollTo(e, 'projects')}
              >
                Projects
              </a>
            </motion.li>
            <motion.li 
              className="nav-item"
              custom={3}
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
            >
              <a 
                className="nav-link" 
                href="/khalfe_azaan_resume_24.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                Resume
              </a>
            </motion.li>
          </ul>
          
          {/* Beautiful Clean Theme Toggle */}
          <motion.div 
            className="d-flex align-items-center ms-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <motion.button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              style={{ 
                border: 'none',
                background: 'rgba(0, 123, 255, 0.08)',
                color: isDarkMode ? '#ffd43b' : '#495057',
                fontSize: '1.3rem',
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              whileHover={{ 
                scale: 1.1, 
                background: isDarkMode 
                  ? 'rgba(255, 212, 59, 0.15)' 
                  : 'rgba(73, 80, 87, 0.15)',
                boxShadow: isDarkMode 
                  ? '0 4px 15px rgba(255, 212, 59, 0.3)'
                  : '0 4px 15px rgba(73, 80, 87, 0.3)'
              }}
              whileTap={{ scale: 0.9 }}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <motion.i 
                className={isDarkMode ? 'fas fa-sun' : 'fas fa-moon'}
                animate={{ 
                  rotate: isDarkMode ? [0, 360] : [360, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 0.5 }}
              />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;