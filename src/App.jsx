import React, { Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import { ThemeProvider } from './context/ThemeContext';

const Header = lazy(() => import('./components/Header'));
const About = lazy(() => import('./components/About'));
const Projects = lazy(() => import('./components/Projects'));
const Resume = lazy(() => import('./components/Resume'));

const App = () => {
  return (
    <ThemeProvider>
      <div className="app">
        <Navbar />
        <Suspense fallback={<div>Loading...</div>}>
          <Header />
          <About />
          <Projects />
          <Resume />
        </Suspense>
      </div>
    </ThemeProvider>
  );
};

export default App;