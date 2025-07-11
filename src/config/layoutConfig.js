// Layout Configuration System
// Easy to modify approach - just change the config to switch layouts

export const LAYOUT_TYPES = {
  TRADITIONAL: 'traditional',
  BENTO: 'bento',
  HYBRID: 'hybrid'
};

export const layoutConfig = {
  // Current layout type - easy to change
  currentLayout: LAYOUT_TYPES.HYBRID,
  
  // Layout-specific settings
  layouts: {
    [LAYOUT_TYPES.TRADITIONAL]: {
      aboutSection: {
        type: 'paragraphs',
        columns: 1,
        maxWidth: 'col-lg-8'
      },
      projectsSection: {
        type: 'cards',
        columns: 3,
        layout: 'grid'
      }
    },
    
    [LAYOUT_TYPES.BENTO]: {
      aboutSection: {
        type: 'bento-grid',
        columns: 'auto',
        areas: ['skills', 'bio', 'interests', 'education']
      },
      projectsSection: {
        type: 'bento-cards',
        columns: 'masonry',
        layout: 'bento'
      }
    },
    
    [LAYOUT_TYPES.HYBRID]: {
      aboutSection: {
        type: 'bento-grid', // Use bento for about
        columns: 'auto',
        areas: ['skills', 'bio', 'interests', 'education']
      },
      projectsSection: {
        type: 'cards', // Keep traditional cards for projects
        columns: 3,
        layout: 'grid'
      }
    }
  },

  // Animation settings
  animations: {
    enabled: true,
    staggerDelay: 0.1,
    duration: 0.6
  },

  // Theme integration
  themeAware: true
};

// Helper function to get current layout settings
export const getCurrentLayoutConfig = () => {
  return layoutConfig.layouts[layoutConfig.currentLayout];
};

// Helper function to switch layout (for easy future changes)
export const switchLayout = (newLayoutType) => {
  if (LAYOUT_TYPES[newLayoutType.toUpperCase()]) {
    layoutConfig.currentLayout = newLayoutType;
    return true;
  }
  console.warn(`Invalid layout type: ${newLayoutType}`);
  return false;
};