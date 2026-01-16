import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import SteamBentoCard from './SteamBentoCard';
import ContactFormShadcn from './ContactFormShadcn';

const BentoAbout = () => {
  const { isDarkMode } = useTheme();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  
  // Reading progress - easy to update in one place
  const readingProgress = 15; // Update this percentage as you progress
  
  // Enhanced animation variants for the centerpiece
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
        rotateY: 3,
        boxShadow: "0 25px 50px rgba(34, 139, 230, 0.3)",
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
        y: -12,
        boxShadow: "0 20px 40px rgba(40, 192, 87, 0.4)",
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
        boxShadow: "0 20px 40px rgba(23, 162, 184, 0.4)",
        transition: { type: "spring", stiffness: 350 }
      }
    },
    reading: {
      initial: { opacity: 0, y: 50, skewX: 10 },
      animate: { 
        opacity: 1, 
        y: 0, 
        skewX: 0,
        transition: { 
          type: "spring", 
          damping: 18, 
          stiffness: 160,
          delay: 0.35
        }
      },
      hover: { 
        scale: 1.03, 
        skewX: -1,
        y: -10,
        boxShadow: "0 25px 50px rgba(129, 140, 248, 0.3)",
        transition: { type: "spring", stiffness: 300 }
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
        y: -10,
        boxShadow: "0 25px 50px rgba(255, 193, 7, 0.3)",
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
        scale: 1.05, 
        y: -15,
        rotateZ: 2,
        boxShadow: "0 25px 50px rgba(174, 62, 201, 0.4)",
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

  // Page turning animation for reading card
  const pageAnimation = {
    rotateY: [0, 5, -5, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  // Enhanced bento cards with integrated contact/resume
  const bentoCards = [
    {
      id: 'bio',
      title: 'Background',
      gridArea: 'bio',
      className: 'bento-bio',
      gradient: 'linear-gradient(135deg, rgba(34, 139, 230, 0.08), rgba(34, 139, 230, 0.03))',
      content: (
        <div className="p-4">
          <div className="d-flex align-items-center mb-3">
            <motion.div 
              className="me-3"
              animate={hoveredCard === 'bio' ? floatingAnimation : {}}
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.6 }}
            >
              <i className="fas fa-user-graduate text-primary" style={{ fontSize: '2.5rem' }}></i>
            </motion.div>
            <div>
              <motion.h5 
                className="mb-1"
                style={{ fontSize: '1.4rem', fontWeight: '600' }}
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
            style={{ fontSize: '1rem', lineHeight: '1.6' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            Recent CS graduate passionate about systems engineering and distributed computing. 
            Eager to contribute fresh perspectives to innovative tech projects and tackle challenging 
            problems in fault-tolerant systems.
          </motion.p>
        </div>
      )
    },
    
    {
      id: 'skills',
      title: 'Technical Focus',
      gridArea: 'skills',
      className: 'bento-skills',
      gradient: 'linear-gradient(135deg, rgba(40, 192, 87, 0.08), rgba(40, 192, 87, 0.03))',
      content: (
        <div className="p-4">
          <div className="d-flex align-items-center mb-3">
            <motion.div 
              className="me-3"
              animate={hoveredCard === 'skills' ? floatingAnimation : {}}
              whileHover={{ scale: 1.3, rotateY: 180 }}
              transition={{ duration: 0.4 }}
            >
              <i className="fas fa-code text-success" style={{ fontSize: '2.2rem' }}></i>
            </motion.div>
            <motion.h5 
              className="mb-0"
              style={{ fontSize: '1.3rem', fontWeight: '600' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              Distributed Systems
            </motion.h5>
          </div>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {['Java', 'Systems Design', 'Algorithms', 'Networking'].map((skill, index) => (
              <motion.span
                key={index}
                className="badge bg-light text-dark px-3 py-2"
                style={{ fontSize: '0.85rem', borderRadius: '12px' }}
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
            className="mb-0 small"
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
      gradient: 'linear-gradient(135deg, rgba(23, 162, 184, 0.08), rgba(23, 162, 184, 0.03))',
      content: (
        <SteamBentoCard 
          isHovered={hoveredCard === 'interests'}
          onHover={() => setHoveredCard('interests')}
          onHoverEnd={() => setHoveredCard(null)}
        />
      )
    },

    {
      id: 'reading',
      title: 'Currently Reading',
      gridArea: 'reading',
      className: 'bento-reading',
      gradient: 'linear-gradient(135deg, rgba(129, 140, 248, 0.08), rgba(129, 140, 248, 0.03))',
      content: (
        <div className="p-4">
          <div className="d-flex align-items-center mb-3">
            <motion.div 
              className="me-3"
              animate={hoveredCard === 'reading' ? pageAnimation : floatingAnimation}
              whileHover={{ scale: 1.3, rotateZ: 15 }}
              transition={{ duration: 0.4 }}
            >
              <i className="fas fa-book-open" style={{ fontSize: '2.2rem', color: '#818cf8' }}></i>
            </motion.div>
            <motion.h5 
              className="mb-0"
              style={{ fontSize: '1.3rem', fontWeight: '600' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              Learning Journey
            </motion.h5>
          </div>
          
          <motion.div 
            className="book-info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <div className="fw-medium mb-2" style={{ 
              color: isDarkMode ? '#c1c2c5' : '#1a1b1e',
              fontSize: '1rem'
            }}>
              System Design Interview Vol. 2
            </div>
            <small className="text-muted d-block mb-2">
              by Alex Xu
            </small>
            <div className="d-flex align-items-center">
              <motion.div 
                className="progress-bar-container"
                style={{
                  flex: 1,
                  height: '6px',
                  background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginRight: '12px'
                }}
              >
                <motion.div
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #818cf8, #a5b4fc)',
                    borderRadius: '3px'
                  }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${readingProgress}%` }}
                  transition={{ delay: 1.5, duration: 1.5, ease: "easeOut" }}
                />
              </motion.div>
              <small className="text-muted fw-medium">{readingProgress}%</small>
            </div>
          </motion.div>
          
          <motion.p 
            className="mt-3 mb-0 small"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.5 }}
          >
            Deep-diving into advanced system design patterns and architecture principles.
          </motion.p>
        </div>
      )
    },
    
    {
      id: 'goals',
      title: 'Professional Goals',
      gridArea: 'goals',
      className: 'bento-goals',
      gradient: 'linear-gradient(135deg, rgba(255, 193, 7, 0.08), rgba(255, 193, 7, 0.03))',
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
              <i className="fas fa-rocket text-warning" style={{ fontSize: '2.2rem' }}></i>
            </motion.div>
            <motion.h5 
              className="mb-0"
              style={{ fontSize: '1.3rem', fontWeight: '600' }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              Looking Forward
            </motion.h5>
          </div>
          
          <motion.p 
            className="mb-3"
            style={{ fontSize: '0.95rem', lineHeight: '1.5' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            Tackle challenging distributed system problems and push boundaries of what's possible with code. 
            Ready to contribute to innovative projects.
          </motion.p>
          
          {/* Integrated Resume Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            <motion.a
              href="/azaan_resume_.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-warning btn-lg"
              style={{
                background: 'linear-gradient(135deg, #ffc107, #ff8f00)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#000',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              whileHover={{ 
                scale: 1.05,
                background: 'linear-gradient(135deg, #ff8f00, #e65100)',
                color: '#fff',
                boxShadow: '0 8px 25px rgba(255, 193, 7, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="fas fa-file-alt"></i>
              View Resume
            </motion.a>
          </motion.div>
        </div>
      )
    },
    
    {
      id: 'connect',
      title: 'Let\'s Connect',
      gridArea: 'connect',
      className: 'bento-connect',
      gradient: 'linear-gradient(135deg, rgba(174, 62, 201, 0.08), rgba(174, 62, 201, 0.03))',
      content: (
        <div className="p-4">
          <div className="d-flex align-items-center mb-3">
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
            <motion.h5 
              className="mb-0"
              style={{ fontSize: '1.3rem', fontWeight: '600' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              Let's Connect
            </motion.h5>
          </div>
          
          <motion.p 
            className="mb-3"
            style={{ fontSize: '0.95rem' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            Ready to explore how we can create something amazing together! Feel free to reach out.
          </motion.p>
          
          {/* Enhanced Contact Options */}
          <motion.div
            className="contact-actions d-flex gap-3 align-items-center flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            <motion.button
              onClick={() => setShowContactForm(true)}
              className="contact-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '45px',
                height: '45px',
                background: 'rgba(0, 123, 255, 0.1)',
                color: '#007bff',
                borderRadius: '12px',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer'
              }}
              whileHover={{ 
                background: '#007bff',
                color: '#fff',
                scale: 1.1,
                y: -2
              }}
              whileTap={{ scale: 0.9 }}
              title="Send Email"
            >
              <i className="fas fa-envelope"></i>
            </motion.button>
            
            <motion.a
              href="https://www.linkedin.com/in/azaan-khalfe-43b90b221/"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '45px',
                height: '45px',
                background: 'rgba(0, 123, 255, 0.1)',
                color: '#007bff',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '1.2rem'
              }}
              whileHover={{ 
                background: '#0077b5',
                color: '#fff',
                scale: 1.1,
                y: -2
              }}
              whileTap={{ scale: 0.9 }}
              title="LinkedIn Profile"
            >
              <i className="fab fa-linkedin"></i>
            </motion.a>
            
            <motion.a
              href="https://github.com/AzaanKH"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '45px',
                height: '45px',
                background: 'rgba(0, 123, 255, 0.1)',
                color: '#007bff',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '1.2rem'
              }}
              whileHover={{ 
                background: '#333',
                color: '#fff',
                scale: 1.1,
                y: -2
              }}
              whileTap={{ scale: 0.9 }}
              title="GitHub Profile"
            >
              <i className="fab fa-github"></i>
            </motion.a>
          </motion.div>
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
    <section id="bio" className="section py-5" style={{ background: '#f8f9fa' }}>
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
          style={{ fontSize: '2.5rem', fontWeight: '600', marginBottom: '3rem' }}
        >
          About Me
        </motion.h2>
        
        <motion.div 
          className="enhanced-bento-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gridTemplateRows: 'repeat(4, minmax(200px, auto))',
            gap: '2rem',
            gridTemplateAreas: `
              "bio bio bio"
              "skills interests reading"
              "goals goals goals"
              "connect connect connect"
            `,
            '--card-bg': isDarkMode ? '#25262B' : '#ffffff',
            '--card-border': isDarkMode ? '#2C2E33' : '#dee2e6',
            '--card-shadow': isDarkMode ? '0 8px 25px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          {bentoCards.map((card, _index) => (
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
                border: '2px solid var(--card-border)',
                borderRadius: '20px',
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
            .enhanced-bento-grid {
              grid-template-columns: 1fr !important;
              grid-template-areas: 
                "bio"
                "skills"
                "interests"
                "reading"
                "goals"
                "connect" !important;
              gap: 1.5rem !important;
            }
          }
          
          @media (max-width: 992px) and (min-width: 769px) {
            .enhanced-bento-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              grid-template-areas: 
                "bio bio"
                "skills interests"
                "reading goals"
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
      
      {/* Contact Form Modal */}
      <ContactFormShadcn 
        open={showContactForm} 
        onClose={() => setShowContactForm(false)} 
      />
    </section>
  );
};

export default BentoAbout;