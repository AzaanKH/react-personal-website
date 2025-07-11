import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ContactForm from './ContactForm';

const Header = () => {
  const [showContactForm, setShowContactForm] = useState(false);

  // Progressive reveal animation sequence
  const headerSequence = {
    name: {
      initial: { opacity: 0, y: -30 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.8, ease: "easeOut" }
    },
    subtitle: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, delay: 0.3, ease: "easeOut" }
    },
    social: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.5, delay: 0.6, ease: "easeOut" }
    },
    indicator: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, delay: 1.5, ease: "easeOut" }
    }
  };

  return (
    <section className="header-section text-center">
      <div className="container">
        {/* Quick name introduction */}
        <motion.h1 
          className="display-4 mb-3" 
          id="azaan-khalfe"
          {...headerSequence.name}
          style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '700',
            marginBottom: '0.5rem'
          }}
        >
          Azaan Khalfe
        </motion.h1>
        
        {/* Clean subtitle */}
        <motion.p
          className="lead mb-4"
          {...headerSequence.subtitle}
          style={{ 
            fontSize: '1.25rem',
            opacity: 0.85,
            fontWeight: '400',
            marginBottom: '2rem'
          }}
        >
          Computer Science Graduate | Systems Engineer
        </motion.p>
        
        {/* Social links with staggered animation */}
        <motion.div 
          className="social-links d-flex justify-content-center gap-4"
          {...headerSequence.social}
        >
          {[
            { href: "https://github.com/AzaanKH", icon: "fab fa-github", delay: 0.1, label: "GitHub" },
            { href: "https://www.linkedin.com/in/azaan-khalfe-43b90b221/", icon: "fab fa-linkedin", delay: 0.2, label: "LinkedIn" },
            { onClick: () => setShowContactForm(true), icon: "fas fa-envelope", delay: 0.3, label: "Email" }
          ].map((link, index) => (
            <motion.a 
              key={index}
              href={link.href}
              onClick={link.onClick}
              target={link.href ? "_blank" : undefined}
              rel={link.href ? "noopener noreferrer" : undefined}
              className="social-link-clean"
              style={{ cursor: 'pointer' }}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                delay: 0.8 + link.delay, 
                duration: 0.4,
                type: "spring",
                stiffness: 200
              }}
              whileHover={{ 
                scale: 1.15, 
                y: -3,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              title={link.label}
            >
              <i className={link.icon}></i>
            </motion.a>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          className="scroll-indicator mt-5"
          {...headerSequence.indicator}
        >
          <motion.div
            animate={{ 
              y: [0, 8, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <i 
              className="fas fa-chevron-down text-muted" 
              style={{ fontSize: '1.3rem', opacity: 0.6 }}
            ></i>
          </motion.div>
          <small className="text-muted d-block mt-2" style={{ 
            fontSize: '0.8rem', 
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            Scroll to explore
          </small>
        </motion.div>
      </div>
      
      {showContactForm && <ContactForm onClose={() => setShowContactForm(false)} />}
    </section>
  );
};

export default Header;