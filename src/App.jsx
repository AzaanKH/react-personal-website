import React, { Suspense, lazy } from 'react';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';
import Navbar from './components/Navbar';
import { ThemeProvider } from './context/ThemeContext';

import Header from './components/Header';
import About from './components/About';
import Projects from './components/Projects';
import Resume from './components/Resume';
import ScrollProgressBar from './components/ScrollProgressBar';
import CursorFollower from './components/CursorFollower';

const App = () => {
  return (
    <ThemeProvider>
      <LayoutGroup>
        <div className="app">
          {/* Add scroll progress bar */}
          <ScrollProgressBar />
          
          {/* Add cursor follower */}
          {/* <CursorFollower /> */}
          
          <Navbar />
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
              <motion.div id="content-wrapper">
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
                
                <motion.section 
                  id="about"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8 }}
                  layout
                >
                  <About />
                </motion.section>
                
                <motion.section 
                  id="projects"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8 }}
                  layout
                >
                  <Projects />
                </motion.section>
                
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