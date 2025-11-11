import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentLayoutConfig, LAYOUT_TYPES, layoutConfig } from '../config/layoutConfig';

// Import active layout components
import BentoAboutEnhanced from './BentoAboutEnhanced';
import ProjectsShadcn from './ProjectsShadcn';

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

    // Currently only using bento-grid layout (HYBRID mode)
    // Traditional About component archived in archive/unused-components/
    switch (aboutConfig.type) {
      case 'bento-grid':
        return (
          <motion.div key="bento-about-enhanced" {...layoutTransition}>
            <BentoAboutEnhanced />
          </motion.div>
        );

      case 'paragraphs':
      default:
        // Fallback to bento-grid if paragraphs layout requested
        // (About.jsx component is archived)
        return (
          <motion.div key="bento-about-fallback" {...layoutTransition}>
            <BentoAboutEnhanced />
          </motion.div>
        );
    }
  };

  // Render Projects section based on configuration  
  const renderProjectsSection = () => {
    const _projectsConfig = currentConfig.projectsSection;
    
    // Use shadcn-styled Projects component to match the theme
    return (
      <motion.div key="projects-shadcn" {...layoutTransition}>
        <ProjectsShadcn />
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