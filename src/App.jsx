import React, { Suspense, lazy, useState, useEffect } from 'react';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';
import Navbar from './components/Navbar';
import { ThemeProvider } from './context/ThemeContext';

import Header from './components/Header';
import AdaptiveLayout from './components/AdaptiveLayout';
import Resume from './components/Resume';
import ScrollProgressBar from './components/ScrollProgressBar';
import CursorFollower from './components/CursorFollower';

// Import the layout switcher for development/testing
// import { LayoutSwitcher } from './components/AdaptiveLayout';
// import SteamDebugTester from './components/SteamDebugTester';

const App = () => {
  const [layoutKey, setLayoutKey] = useState(0);

  // Listen for layout changes to trigger re-render
  useEffect(() => {
    const handleLayoutChange = () => {
      setLayoutKey(prev => prev + 1);
    };

    window.addEventListener('layoutChange', handleLayoutChange);
    return () => window.removeEventListener('layoutChange', handleLayoutChange);
  }, []);

  return (
    <ThemeProvider>
      <LayoutGroup>
        <div className="app">
          {/* Add scroll progress bar */}
          <ScrollProgressBar />
          
          {/* Add cursor follower - uncomment if desired */}
          {/* <CursorFollower /> */}
          
          <Navbar />

          {/* Layout Switcher - only show in development */}
          {/* {process.env.NODE_ENV === 'development' && <LayoutSwitcher />} */}
          
          {/* Steam Debug Tester - only show in development */}
          {/* {process.env.NODE_ENV === 'development' && <SteamDebugTester />} */}
          
          <Suspense fallback={
            <div className="d-flex justify-content-center align-items-center min-vh-100">
              <motion.div 
                className="spinner-border text-primary" 
                role="status"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <span className="visually-hidden">Loading...</span>
              </motion.div>
            </div>
          }>
            <AnimatePresence>
              <motion.div id="content-wrapper" key={layoutKey}>
                <motion.section 
                  id="header"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  layout
                >
                  <Header />
                </motion.section>
                
                {/* Use AdaptiveLayout instead of individual components */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.8 }}
                  layout
                >
                  <AdaptiveLayout />
                </motion.div>
                
                <motion.section 
                  id="resume"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8 }}
                  layout
                >
                  <Resume />
                </motion.section>
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </div>
      </LayoutGroup>
    </ThemeProvider>
  );
};

export default App;