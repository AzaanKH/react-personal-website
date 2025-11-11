import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const navLinkStyle = {
    color: 'hsl(var(--foreground))',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
    fontWeight: '500'
  };

  const handleNavHover = (e, isEntering) => {
    if (isEntering) {
      e.target.style.backgroundColor = 'hsl(var(--accent))';
      e.target.style.color = 'hsl(var(--accent-foreground))';
    } else {
      e.target.style.backgroundColor = 'transparent';
      e.target.style.color = 'hsl(var(--foreground))';
    }
  };

  const handleScrollTo = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    
    if (element) {
      const navbarHeight = targetId === 'azaan-khalfe' ? 100 : 80;
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
      className="navbar navbar-expand-lg navbar-light sticky-top"
      style={{
        backgroundColor: 'hsl(var(--background) / 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid hsl(var(--border))',
        transition: 'all 0.3s ease'
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
    >
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          className="navbar-toggler d-lg-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="navbar-collapse" id="navbarNav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <ul className="navbar-nav" style={{ display: 'flex', flexDirection: 'row', gap: '1rem', margin: 0, padding: 0, listStyle: 'none' }}>
            <motion.li
              className="nav-item"
              custom={0}
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
              style={{ display: 'inline-block', margin: 0, padding: 0 }}
            >
              <a 
                className="nav-link" 
                href="#azaan-khalfe"
                onClick={(e) => handleScrollTo(e, 'azaan-khalfe')}
                style={navLinkStyle}
                onMouseEnter={(e) => handleNavHover(e, true)}
                onMouseLeave={(e) => handleNavHover(e, false)}
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
              style={{ display: 'inline-block', margin: 0, padding: 0 }}
            >
              <a 
                className="nav-link" 
                href="#bio"
                onClick={(e) => handleScrollTo(e, 'bio')}
                style={navLinkStyle}
                onMouseEnter={(e) => handleNavHover(e, true)}
                onMouseLeave={(e) => handleNavHover(e, false)}
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
              style={{ display: 'inline-block', margin: 0, padding: 0 }}
            >
              <a 
                className="nav-link" 
                href="#projects"
                onClick={(e) => handleScrollTo(e, 'projects')}
                style={navLinkStyle}
                onMouseEnter={(e) => handleNavHover(e, true)}
                onMouseLeave={(e) => handleNavHover(e, false)}
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
              style={{ display: 'inline-block', margin: 0, padding: 0 }}
            >
              <a 
                className="nav-link" 
                href="/khalfe_azaan_resume_24.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={navLinkStyle}
                onMouseEnter={(e) => handleNavHover(e, true)}
                onMouseLeave={(e) => handleNavHover(e, false)}
              >
                Resume
              </a>
            </motion.li>
          </ul>

          {/* Beautiful Clean Theme Toggle */}
          <motion.div
            style={{ display: 'flex', alignItems: 'center' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <motion.button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              style={{ 
                border: '1px solid hsl(var(--border))',
                backgroundColor: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                fontSize: '1.2rem',
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              whileHover={{ 
                scale: 1.1, 
                backgroundColor: 'hsl(var(--accent))',
                borderColor: 'hsl(var(--ring))',
                boxShadow: '0 4px 15px hsl(var(--primary) / 0.3)'
              }}
              whileTap={{ scale: 0.9 }}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <motion.div
                animate={{ 
                  rotate: isDarkMode ? [0, 360] : [360, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 0.5 }}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" style={{color: '#ffd43b'}} />
                ) : (
                  <Moon className="w-4 h-4" style={{color: '#64748b'}} />
                )}
              </motion.div>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;