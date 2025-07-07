import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ContactForm from './ContactForm';

const Header = () => {
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <section className="header-section text-center">
      <div className="container">
        <motion.h1 
          className="display-4 mb-4" 
          id="azaan-khalfe"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Azaan Khalfe
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Computer Science Graduate | Systems Engineer
        </motion.p>
        
        <motion.div 
          className="social-links mt-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <motion.a 
            href="https://github.com/AzaanKH" 
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, color: "#007bff" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <i className="fab fa-github"></i>
          </motion.a>
          
          <motion.a 
            href="https://www.linkedin.com/in/azaan-khalfe-43b90b221/" 
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, color: "#007bff" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <i className="fab fa-linkedin"></i>
          </motion.a>
          
          <motion.a 
            onClick={() => setShowContactForm(true)} 
            style={{ cursor: 'pointer' }}
            whileHover={{ scale: 1.2, color: "#007bff" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <i className="fas fa-envelope"></i>
          </motion.a>
        </motion.div>
      </div>
      {showContactForm && <ContactForm onClose={() => setShowContactForm(false)} />}
    </section>
  );
};

export default Header;