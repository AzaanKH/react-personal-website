import React, { useState, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import SteamBentoCard from './SteamBentoCard';

const BentoAbout = () => {
  const { isDarkMode } = useTheme();
  const [hoveredCard, setHoveredCard] = useState(null);
  
  // Unique animation variants for different cards
  const cardAnimations = {
    bio: {
      initial: { opacity: 0, rotateY: -90, scale: 0.5 },
      animate: { 
        opacity: 1, 
        rotateY: 0, 
        scale: 1,
        transition: { 
          type: "spring", 
          damping: 15, 
          stiffness: 200,
          delay: 0.1
        }
      },
      hover: { 
        scale: 1.02, 
        rotateY: 5,
        boxShadow: "0 20px 40px rgba(34, 139, 230, 0.3)",
        transition: { type: "spring", stiffness: 300 }
      }
    },
    skills: {
      initial: { opacity: 0, x: -100, rotate: -10 },
      animate: { 
        opacity: 1, 
        x: 0, 
        rotate: 0,
        transition: { 
          type: "spring", 
          damping: 20, 
          stiffness: 150,
          delay: 0.2
        }
      },
      hover: { 
        scale: 1.05, 
        rotate: 2,
        y: -10,
        boxShadow: "0 15px 30px rgba(40, 192, 87, 0.4)",
        transition: { type: "spring", stiffness: 400 }
      }
    },
    interests: {
      initial: { opacity: 0, scale: 0, rotate: 180 },
      animate: { 
        opacity: 1, 
        scale: 1, 
        rotate: 0,
        transition: { 
          type: "spring", 
          damping: 12, 
          stiffness: 180,
          delay: 0.3
        }
      },
      hover: { 
        scale: 1.08, 
        rotate: -3,
        boxShadow: "0 18px 35px rgba(255, 193, 7, 0.4)",
        transition: { type: "spring", stiffness: 350 }
      }
    },
    goals: {
      initial: { opacity: 0, y: 100, skewY: 10 },
      animate: { 
        opacity: 1, 
        y: 0, 
        skewY: 0,
        transition: { 
          type: "spring", 
          damping: 18, 
          stiffness: 160,
          delay: 0.4
        }
      },
      hover: { 
        scale: 1.03, 
        skewY: -1,
        y: -8,
        boxShadow: "0 25px 50px rgba(23, 162, 184, 0.3)",
        transition: { type: "spring", stiffness: 300 }
      }
    },
    connect: {
      initial: { opacity: 0, scale: 0.3, y: 50 },
      animate: { 
        opacity: 1, 
        scale: 1, 
        y: 0,
        transition: { 
          type: "spring", 
          damping: 10, 
          stiffness: 120,
          delay: 0.5
        }
      },
      hover: { 
        scale: 1.1, 
        y: -15,
        rotateZ: 5,
        boxShadow: "0 20px 40px rgba(174, 62, 201, 0.4)",
        transition: { type: "spring", stiffness: 400 }
      }
    }
  };

  // Floating animation for icons
  const floatingAnimation = {
    y: [-5, 5, -5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  // Pulse animation for connect button
  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  // Bento grid content with enhanced animations
  const bentoCards = [
    {
      id: 'bio',
      title: 'About Me',
      gridArea: 'bio',
      className: 'bento-bio',
      gradient: 'linear-gradient(135deg, rgba(34, 139, 230, 0.1), rgba(34, 139, 230, 0.05))',
      content: (
        <div className="p-4">
          <div className="d-flex align-items-center mb-3">
            <motion.div 
              className="me-3"
              animate={hoveredCard === 'bio' ? floatingAnimation : {}}
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.6 }}
            >
              <i className="fas fa-user-graduate text-primary" style={{ fontSize: '2rem' }}></i>
            </motion.div>
            <div>
              <motion.h5 
                className="mb-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                Computer Science Graduate
              </motion.h5>
              <motion.small 
                className="text-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                University of Washington
              </motion.small>
            </div>
          </div>
          <motion.p 
            className="mb-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            Recent CS graduate passionate about systems engineering and distributed computing. 
            Eager to contribute fresh perspectives to innovative tech projects.
          </motion.p>
        </div>
      )
    },
    
    {
      id: 'skills',
      title: 'Technical Focus',
      gridArea: 'skills',
      className: 'bento-skills',
      gradient: 'linear-gradient(135deg, rgba(40, 192, 87, 0.1), rgba(40, 192, 87, 0.05))',
      content: (
        <div className="p-4">
          <div className="d-flex align-items-center mb-3">
            <motion.div 
              className="me-3"
              animate={hoveredCard === 'skills' ? floatingAnimation : {}}
              whileHover={{ scale: 1.3, rotateY: 180 }}
              transition={{ duration: 0.4 }}
            >
              <i className="fas fa-code text-success" style={{ fontSize: '2rem' }}></i>
            </motion.div>
            <motion.h5 
              className="mb-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              Distributed Systems
            </motion.h5>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {['Java', 'Systems Design', 'Algorithms', 'Networking'].map((skill, index) => (
              <motion.span
                key={index}
                className="badge bg-light text-dark px-2 py-1"
                style={{ fontSize: '0.8rem' }}
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 1 + (index * 0.1), 
                  type: "spring", 
                  stiffness: 200 
                }}
                whileHover={{ 
                  scale: 1.1, 
                  rotate: 5,
                  backgroundColor: '#28a745',
                  color: '#fff'
                }}
              >
                {skill}
              </motion.span>
            ))}
          </div>
          <motion.p 
            className="mt-3 mb-0 small"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            Specialized in fault-tolerant systems and consensus algorithms.
          </motion.p>
        </div>
      )
    },
    
    {
      id: 'interests',
      title: 'Gaming Profile',
      gridArea: 'interests',
      className: 'bento-interests',
      gradient: 'linear-gradient(135deg, rgba(23, 162, 184, 0.1), rgba(23, 162, 184, 0.05))',
      content: (
        <SteamBentoCard 
          isHovered={hoveredCard === 'interests'}
          onHover={() => setHoveredCard('interests')}
          onHoverEnd={() => setHoveredCard(null)}
        />
      )
    },
    
    {
      id: 'goals',
      title: 'Professional Goals',
      gridArea: 'goals',
      className: 'bento-goals',
      gradient: 'linear-gradient(135deg, rgba(23, 162, 184, 0.1), rgba(23, 162, 184, 0.05))',
      content: (
        <div className="p-4">
          <div className="d-flex align-items-center mb-3">
            <motion.div 
              className="me-3"
              animate={hoveredCard === 'goals' ? {
                y: [-5, -15, -5],
                rotate: [0, 10, -10, 0]
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              whileHover={{ scale: 1.4, rotate: 45 }}
            >
              <i className="fas fa-rocket text-info" style={{ fontSize: '2rem' }}></i>
            </motion.div>
            <motion.h5 
              className="mb-0"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              Looking Forward
            </motion.h5>
          </div>
          <ul className="list-unstyled small mb-0">
            {[
              'Tackle challenging distributed system problems',
              'Push boundaries of what\'s possible with code',
              'Contribute fresh perspectives to innovative projects'
            ].map((goal, index) => (
              <motion.li 
                key={index}
                className="mb-2"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + (index * 0.1), type: "spring", stiffness: 100 }}
                whileHover={{ x: 10, color: '#17a2b8' }}
              >
                <motion.i 
                  className="fas fa-check text-success me-2"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 1.3 + (index * 0.1), type: "spring" }}
                ></motion.i>
                {goal}
              </motion.li>
            ))}
          </ul>
        </div>
      )
    },
    
    {
      id: 'connect',
      title: 'Let\'s Connect',
      gridArea: 'connect',
      className: 'bento-connect',
      gradient: 'linear-gradient(135deg, rgba(174, 62, 201, 0.1), rgba(174, 62, 201, 0.05))',
      content: (
        <div className="p-4 text-center">
          <motion.div 
            className="mb-3"
            animate={hoveredCard === 'connect' ? {
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            } : floatingAnimation}
            transition={{ duration: 2, repeat: Infinity }}
            whileHover={{ rotate: 720, scale: 1.4 }}
          >
            <i className="fas fa-handshake text-primary" style={{ fontSize: '2.5rem' }}></i>
          </motion.div>
          <motion.p 
            className="mb-3 small"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
          >
            Ready to explore how we can create something amazing together!
          </motion.p>
          <motion.button
            className="btn btn-outline-primary btn-sm"
            animate={pulseAnimation}
            whileHover={{ 
              scale: 1.1, 
              backgroundColor: '#007bff',
              color: '#fff',
              boxShadow: '0 5px 15px rgba(0,123,255,0.4)'
            }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              document.querySelector('a[href*="linkedin"]')?.click();
            }}
          >
            <motion.i 
              className="fab fa-linkedin me-2"
              animate={{ rotate: [0, 20, -20, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            ></motion.i>
            Connect
          </motion.button>
        </div>
      )
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  return (
    <section id="bio" className="section py-5">
      <div className="container">
        <motion.h2 
          className="section-title text-center"
          initial={{ opacity: 0, scale: 0.5, rotateX: -90 }}
          whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ 
            type: "spring", 
            damping: 15, 
            stiffness: 200,
            duration: 0.8 
          }}
        >
          About Me
        </motion.h2>
        
        <motion.div 
          className="bento-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gridTemplateRows: 'repeat(3, auto)',
            gap: '1.5rem',
            gridTemplateAreas: `
              "bio bio bio"
              "skills interests goals"
              "connect connect connect"
            `,
            '--card-bg': isDarkMode ? '#25262B' : '#ffffff',
            '--card-border': isDarkMode ? '#2C2E33' : '#dee2e6',
            '--card-shadow': isDarkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          {bentoCards.map((card, index) => (
            <motion.div
              key={card.id}
              className={`bento-card ${card.className}`}
              variants={cardAnimations[card.id]}
              initial="initial"
              animate="animate"
              whileHover="hover"
              onHoverStart={() => setHoveredCard(card.id)}
              onHoverEnd={() => setHoveredCard(null)}
              style={{
                gridArea: card.gridArea,
                background: `${card.gradient}, var(--card-bg)`,
                border: '1px solid var(--card-border)',
                borderRadius: '16px',
                boxShadow: 'var(--card-shadow)',
                overflow: 'hidden',
                cursor: 'pointer',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Animated border effect */}
              <motion.div
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                  background: `linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)`,
                  opacity: 0
                }}
                animate={hoveredCard === card.id ? {
                  opacity: [0, 1, 0],
                  x: ['-100%', '100%']
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              
              {card.content}
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced responsive styles */}
        <style jsx>{`
          @media (max-width: 768px) {
            .bento-grid {
              grid-template-columns: 1fr !important;
              grid-template-areas: 
                "bio"
                "skills"
                "interests"
                "goals"
                "connect" !important;
              gap: 1rem !important;
            }
          }
          
          @media (max-width: 992px) and (min-width: 769px) {
            .bento-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              grid-template-areas: 
                "bio bio"
                "skills interests"
                "goals connect"
                "connect connect" !important;
            }
          }

          .bento-card {
            position: relative;
            overflow: hidden;
          }

          .bento-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.05), transparent);
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
          }

          .bento-card:hover::before {
            opacity: 1;
          }
        `}</style>
      </div>
    </section>
  );
};

export default BentoAbout;