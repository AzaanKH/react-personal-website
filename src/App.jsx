import React, { Suspense, lazy, useEffect } from 'react';
import Navbar from './components/Navbar';
import { ThemeProvider } from './context/ThemeContext';

import Header from './components/Header';
import About from './components/About';
import Projects from './components/Projects';
import Resume from './components/Resume';

const App = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const timer = setTimeout(() => {
      document.querySelectorAll('.scroll-animation').forEach((el) => {
        observer.observe(el);
      });
    }, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <ThemeProvider>
      <div className="app">
        <Navbar />
        <Suspense fallback={
          <div className="d-flex justify-content-center align-items-center min-vh-100">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        }>
          <div id="content-wrapper">
            <section id="header" className="scroll-animation">
              <Header />
            </section>
            <section id="about" className="scroll-animation">
              <About />
            </section>
            <section id="projects" className="scroll-animation">
              <Projects />
            </section>
            <section id="resume" className="scroll-animation">
              <Resume />
            </section>
          </div>
        </Suspense>
      </div>
    </ThemeProvider>
  );
};

export default App;