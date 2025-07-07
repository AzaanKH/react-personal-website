import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

// Mantine-inspired dark theme color palette
const mantineDarkColors = {
  dark0: '#C1C2C5', // Text light
  dark1: '#A6A7AB', // Text muted
  dark2: '#909296', // Text dimmed
  dark3: '#5C5F66', // Text subtle
  dark4: '#373A40', // Background subtle
  dark5: '#2C2E33', // Background muted
  dark6: '#25262B', // Background component
  dark7: '#1A1B1E', // Background content
  dark8: '#141517', // Background page
  dark9: '#101113', // Background deepest
  primaryLight: '#339AF0', // Primary light shade
  primary: '#228BE6', // Primary color
  primaryDark: '#1C7ED6', // Primary dark shade
  accent: '#ae3ec9', // Purple accent
  accent2: '#4DABF7', // Secondary accent (blue)
  accent3: '#40C057', // Tertiary accent (green)
  border: '#2C2E33', // Border color
  shadow: 'rgba(0, 0, 0, 0.5)', // Shadow color
};

// Light mode color palette
const lightColors = {
  light0: '#1A1B1E', // Text dark
  light1: '#2C2E33', // Text medium
  light2: '#373A40', // Text light
  light3: '#5C5F66', // Text muted
  light4: '#F1F3F5', // Background subtle
  light5: '#E9ECEF', // Background muted
  light6: '#DEE2E6', // Background component
  light7: '#F8F9FA', // Background content
  light8: '#FFFFFF', // Background page
  light9: '#F8F9FA', // Background deepest
  primaryLight: '#74C0FC', // Primary light shade
  primary: '#228BE6', // Primary color
  primaryDark: '#1971C2', // Primary dark shade
  accent: '#be4bdb', // Purple accent
  accent2: '#15AABF', // Secondary accent (cyan)
  accent3: '#82C91E', // Tertiary accent (lime)
  border: '#DEE2E6', // Border color
  shadow: 'rgba(0, 0, 0, 0.1)', // Shadow color
};

const ProjectCard = ({ 
  title, 
  description, 
  githubUrl, // GitHub repository URL
  demoUrl, // Live demo URL (optional)
  tags = [] // Array of technology tags specific to this project
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isDarkMode } = useTheme();
  const [mountedStyle, setMountedStyle] = useState({});

  // Get colors based on current theme
  const colors = isDarkMode ? mantineDarkColors : lightColors;

  // This makes the theme transition smoother by delaying style changes
  useEffect(() => {
    const delay = setTimeout(() => {
      setMountedStyle({
        background: isDarkMode ? colors.dark6 : colors.light8,
        color: isDarkMode ? colors.dark0 : colors.light0,
        borderColor: isDarkMode ? colors.border : colors.border,
      });
    }, 50);
    
    return () => clearTimeout(delay);
  }, [isDarkMode]);

  // Get unique accent color for each card
  const getAccentColor = () => {
    const accents = [
      colors.primary,
      colors.accent,
      colors.accent2,
      colors.accent3,
    ];
    
    // Use a stable method to select color based on title
    const charSum = [...title].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return accents[charSum % accents.length];
  };
  
  const accentColor = getAccentColor();
  
  return (
    <motion.div 
      className="card project-card position-relative overflow-hidden"
      style={{ 
        height: '100%',
        minHeight: '320px',
        padding: 0,
        border: `1px solid ${mountedStyle.borderColor || 'transparent'}`,
        borderRadius: '8px',
        backgroundColor: mountedStyle.background || 'transparent',
        color: mountedStyle.color || 'inherit',
        transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
        boxShadow: isDarkMode 
          ? `0 4px 12px ${colors.shadow}`
          : `0 2px 8px ${colors.shadow}`,
      }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ 
        y: -5,
        boxShadow: isDarkMode 
          ? `0 8px 20px ${colors.shadow}`
          : `0 6px 16px ${colors.shadow}`,
      }}
      layout
    >
      {/* Accent top border */}
      <motion.div 
        className="position-absolute start-0 top-0 w-100"
        style={{
          height: '3px',
          background: accentColor,
          zIndex: 2,
        }}
        animate={{
          opacity: isHovered ? 1 : 0.6,
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Card Content */}
      <div className="card-body d-flex flex-column justify-content-between" style={{ zIndex: 3, padding: '24px' }}>
        <div>
          {/* Title */}
          <motion.div 
            className="mb-3"
            layout
          >
            <motion.h5 
              className="card-title" 
              style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                color: isDarkMode ? colors.dark0 : colors.light0,
                marginBottom: '0.75rem',
                display: 'inline-block',
              }}
              layout
            >
              <span style={{ color: accentColor }}>#</span> {title}
            </motion.h5>
          </motion.div>
          
          {/* Description */}
          <motion.p
            style={{ 
              color: isDarkMode ? colors.dark1 : colors.light2,
              fontSize: '0.95rem',
              lineHeight: '1.5',
            }}
            layout
          >
            {description}
          </motion.p>
        </div>
        
        {/* Button Footer */}
        <motion.div
          className="mt-3 d-flex gap-2"
          layout
        >
          {githubUrl && (
            <motion.a
              href={githubUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-sm"
              style={{
                background: isDarkMode ? colors.dark5 : colors.light5,
                color: isDarkMode ? colors.dark1 : colors.light1,
                border: `1px solid ${isDarkMode ? colors.dark4 : colors.light6}`,
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              whileHover={{ 
                background: isDarkMode ? colors.dark4 : colors.light4,
              }}
              whileTap={{ scale: 0.97 }}
              layout
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              Code
            </motion.a>
          )}
          
          {demoUrl && (
            <motion.a
              href={demoUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-sm"
              style={{
                background: accentColor,
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              whileHover={{ 
                background: isDarkMode ? colors.primaryDark : colors.primaryLight,
              }}
              whileTap={{ scale: 0.97 }}
              layout
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
              Live Demo
            </motion.a>
          )}
        </motion.div>
        
        {/* Tags */}
        {tags && tags.length > 0 && (
          <motion.div 
            className="d-flex gap-2 mt-3 flex-wrap"
            style={{ opacity: 0.8 }}
            layout
          >
            {tags.map((tag, index) => (
              <motion.span
                key={index}
                style={{
                  background: isDarkMode ? colors.dark4 : colors.light4,
                  color: isDarkMode ? colors.dark1 : colors.light2,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  whiteSpace: 'nowrap',
                }}
                whileHover={{ opacity: 1 }}
                layout
              >
                {tag}
              </motion.span>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectCard;