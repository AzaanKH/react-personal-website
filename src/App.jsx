import { Suspense, useState, useEffect } from 'react';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';
import Navbar from './components/Navbar';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';

import Header from './components/Header';
import AdaptiveLayout from './components/AdaptiveLayout';
import Resume from './components/Resume';
import ScrollProgressBar from './components/ScrollProgressBar';

const App = () => {
  const [layoutKey, setLayoutKey] = useState(0);
  const [headerComplete, setHeaderComplete] = useState(false);

  // Listen for layout changes to trigger re-render
  useEffect(() => {
    const handleLayoutChange = () => {
      setLayoutKey(prev => prev + 1);
    };

    window.addEventListener('layoutChange', handleLayoutChange);
    return () => window.removeEventListener('layoutChange', handleLayoutChange);
  }, []);

  // Simulate header animation completion
  useEffect(() => {
    const timer = setTimeout(() => {
      setHeaderComplete(true);
    }, 2000); // Header animations complete after 2 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LayoutGroup>
          <div className="app">
            {/* Scroll progress bar */}
            <ScrollProgressBar />

            <Navbar />

            <Suspense fallback={
            <div className="d-flex justify-content-center align-items-center min-vh-100">
              <motion.div 
                className="spinner-border text-primary" 
                role="status"
                aria-label="Loading content"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <span className="visually-hidden">Loading...</span>
              </motion.div>
            </div>
          }>
            <AnimatePresence>
              <motion.div id="content-wrapper" key={layoutKey}>
                {/* Header Section - Loads First */}
                <motion.section 
                  id="header"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  layout
                >
                  <Header />
                </motion.section>
                
                {/* Enhanced Bento Grid - Loads After Header with Smooth Transition */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ 
                    opacity: headerComplete ? 1 : 0, 
                    y: headerComplete ? 0 : 50 
                  }}
                  transition={{ 
                    duration: 0.8, 
                    delay: headerComplete ? 0 : 0.5,
                    ease: "easeOut" 
                  }}
                  layout
                >
                  <AdaptiveLayout />
                </motion.div>
                
                {/* Projects Section - Continues the Flow */}
                <motion.section 
                  id="projects"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  layout
                >
                  {/* Projects will be rendered by AdaptiveLayout */}
                </motion.section>
                
                {/* Resume Section - Optional, or can be integrated into bento */}
                <motion.section 
                  id="resume"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8 }}
                  layout
                  style={{ display: 'none' }} // Hidden since resume is now in Goals card
                >
                  <Resume />
                </motion.section>
              </motion.div>
            </AnimatePresence>
          </Suspense>
          </div>
        </LayoutGroup>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;