import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import { Sun, Moon } from 'lucide-react';
// import { cn } from '../lib/utils'; // Unused for now

const NavbarShadcn = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const handleScrollTo = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const navbarHeight = targetId === 'azaan-khalfe' ? 120 : 60;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  return (
    <motion.nav 
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile menu button - placeholder for now */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon">
              <span className="sr-only">Open menu</span>
              {/* Add hamburger icon here if needed */}
            </Button>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
            >
              <Button
                variant="ghost"
                className="text-foreground hover:text-primary transition-colors"
                onClick={(e) => handleScrollTo(e, 'azaan-khalfe')}
              >
                Home
              </Button>
            </motion.div>
            <motion.div
              custom={1}
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
            >
              <Button
                variant="ghost"
                className="text-foreground hover:text-primary transition-colors"
                onClick={(e) => handleScrollTo(e, 'bio')}
              >
                About
              </Button>
            </motion.div>
            <motion.div
              custom={2}
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
            >
              <Button
                variant="ghost"
                className="text-foreground hover:text-primary transition-colors"
                onClick={(e) => handleScrollTo(e, 'projects')}
              >
                Projects
              </Button>
            </motion.div>
            <motion.div
              custom={3}
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
            >
              <Button
                variant="ghost"
                asChild
                className="text-foreground hover:text-primary transition-colors"
              >
                <a
                  href="/khalfe_azaan_resume_24.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Resume
                </a>
              </Button>
            </motion.div>
          </div>
          
          {/* Theme Toggle */}
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="relative h-9 w-9"
            >
              <motion.div
                animate={{ 
                  rotate: isDarkMode ? [0, 360] : [360, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 0.5 }}
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-600" />
                )}
              </motion.div>
              <span className="sr-only">
                {isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              </span>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default NavbarShadcn;