import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SteamStatsDashboard from './SteamStatsDashboard';
import SteamProfile from './SteamProfile';

const SteamSection = () => {
  const [showFullDashboard, setShowFullDashboard] = useState(false);
  
  return (
    <section id="steam-gaming" className="section py-5">
      <div className="container">
        <motion.h2 
          className="section-title text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <i className="fab fa-steam me-3 text-info"></i>
          Gaming Profile
        </motion.h2>
        
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {!showFullDashboard ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <SteamProfile />
                
                <motion.div 
                  className="text-center mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <motion.button
                    className="btn btn-info btn-lg"
                    onClick={() => setShowFullDashboard(true)}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: '0 8px 25px rgba(23, 162, 184, 0.3)'
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.i 
                      className="fas fa-chart-line me-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    ></motion.i>
                    View Full Gaming Stats
                  </motion.button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    Steam Gaming Dashboard
                  </motion.h3>
                  
                  <motion.button
                    className="btn btn-outline-secondary"
                    onClick={() => setShowFullDashboard(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Profile
                  </motion.button>
                </div>
                
                <SteamStatsDashboard />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SteamSection;