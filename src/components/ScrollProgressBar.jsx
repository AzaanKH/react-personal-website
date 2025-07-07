import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const { isDarkMode } = useTheme();
  
  // Use colors based on theme
  const colors = isDarkMode 
    ? { primary: '#228BE6', secondary: '#ae3ec9' } 
    : { primary: '#228BE6', secondary: '#be4bdb' };
  
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="progress-bar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
        transformOrigin: '0%',
        scaleX: scaleX,
        zIndex: 1000,
      }}
    />
  );
};

export default ScrollProgressBar;