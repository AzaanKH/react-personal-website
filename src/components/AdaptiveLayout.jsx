import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentLayoutConfig, LAYOUT_TYPES, layoutConfig } from '../config/layoutConfig';

// Import both layout components
import About from './About';
import BentoAbout from './BentoAbout';
import Projects from './Projects';

const AdaptiveLayout = () => {
  const currentConfig = getCurrentLayoutConfig();
  
  // Layout transition animations
  const layoutTransition = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
    transition: { 
      duration: layoutConfig.animations.enabled ? layoutConfig.animations.duration : 0 
    }
  };

  // Render About section based on configuration
  const renderAboutSection = () => {
    const aboutConfig = currentConfig.aboutSection;
    
    switch (aboutConfig.type) {
      case 'bento-grid':
        return (
          <motion.div key="bento-about" {...layoutTransition}>
            <BentoAbout />
          </motion.div>
        );
      
      case 'paragraphs':
      default:
        return (
          <motion.div key="traditional-about" {...layoutTransition}>
            <About />
          </motion.div>
        );
    }
  };

  // Render Projects section based on configuration  
  const renderProjectsSection = () => {
    const projectsConfig = currentConfig.projectsSection;
    
    // For now, we'll keep the existing Projects component
    // But this is where you could add different project layout types
    return (
      <motion.div key="projects" {...layoutTransition}>
        <Projects />
      </motion.div>
    );
  };

  return (
    <div className="adaptive-layout">
      {/* About Section */}
      <AnimatePresence mode="wait">
        {renderAboutSection()}
      </AnimatePresence>

      {/* Projects Section */}
      <AnimatePresence mode="wait">
        {renderProjectsSection()}
      </AnimatePresence>
    </div>
  );
};

// Easy layout switching utility component (for testing/demo)
export const LayoutSwitcher = () => {
  const [currentLayout, setCurrentLayout] = React.useState(layoutConfig.currentLayout);

  const handleLayoutChange = (newLayout) => {
    layoutConfig.currentLayout = newLayout;
    setCurrentLayout(newLayout);
    // Force re-render of the main app
    window.dispatchEvent(new CustomEvent('layoutChange'));
  };

  return (
    <div className="layout-switcher position-fixed bottom-0 end-0 m-3 p-3 bg-dark text-white rounded">
      <h6 className="mb-2">Layout Mode</h6>
      {Object.values(LAYOUT_TYPES).map((layout) => (
        <div key={layout} className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name="layout"
            id={layout}
            checked={currentLayout === layout}
            onChange={() => handleLayoutChange(layout)}
          />
          <label className="form-check-label" htmlFor={layout}>
            {layout.charAt(0).toUpperCase() + layout.slice(1)}
          </label>
        </div>
      ))}
    </div>
  );
};

export default AdaptiveLayout;