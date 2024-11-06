import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const handleScrollTo = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const navbarHeight = 60; // Adjust this value based on actual navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light">
      <div className="container">
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a 
                className="nav-link" 
                href="#bio"
                onClick={(e) => handleScrollTo(e, 'bio')}
              >
                About
              </a>
            </li>
            <li className="nav-item">
              <a 
                className="nav-link" 
                href="#projects"
                onClick={(e) => handleScrollTo(e, 'projects')}
              >
                Projects
              </a>
            </li>
            <li className="nav-item">
              <a 
                className="nav-link" 
                href="/khalfe_azaan_resume_24.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                Resume
              </a>
            </li>
          </ul>
          <div className="d-flex align-items-center ms-auto">
            <span className="me-2">Theme</span>
            <label className="theme-switch">
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={toggleTheme}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;