import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const handleScrollTo = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);

    if (element) {
      const navbarHeight = targetId === 'azaan-khalfe' ? 100 : 80;
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
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border transition-all duration-300"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
    >
      <div className="container mx-auto px-4 flex justify-between items-center py-4">
        <button
          className="navbar-toggler lg:hidden"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="navbar-collapse flex justify-between items-center w-full" id="navbarNav">
          <ul className="flex flex-row gap-4 m-0 p-0 list-none">
            <motion.li
              className="inline-block m-0 p-0"
              custom={0}
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
            >
              <a
                className="text-foreground no-underline px-4 py-2 rounded-md transition-all duration-300 font-medium hover:bg-accent hover:text-accent-foreground"
                href="#azaan-khalfe"
                onClick={(e) => handleScrollTo(e, 'azaan-khalfe')}
              >
                Home
              </a>
            </motion.li>
            <motion.li
              className="inline-block m-0 p-0"
              custom={1}
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
            >
              <a
                className="text-foreground no-underline px-4 py-2 rounded-md transition-all duration-300 font-medium hover:bg-accent hover:text-accent-foreground"
                href="#bio"
                onClick={(e) => handleScrollTo(e, 'bio')}
              >
                About
              </a>
            </motion.li>
            <motion.li
              className="inline-block m-0 p-0"
              custom={2}
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
            >
              <a
                className="text-foreground no-underline px-4 py-2 rounded-md transition-all duration-300 font-medium hover:bg-accent hover:text-accent-foreground"
                href="#projects"
                onClick={(e) => handleScrollTo(e, 'projects')}
              >
                Projects
              </a>
            </motion.li>
            <motion.li
              className="inline-block m-0 p-0"
              custom={3}
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
            >
              <a
                className="text-foreground no-underline px-4 py-2 rounded-md transition-all duration-300 font-medium hover:bg-accent hover:text-accent-foreground"
                href="azaan_resume_.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                Resume
              </a>
            </motion.li>
          </ul>

          {/* Beautiful Clean Theme Toggle */}
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <motion.button
              onClick={toggleTheme}
              className="border border-border bg-background text-foreground w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:bg-accent hover:border-ring hover:shadow-lg hover:shadow-primary/30"
              whileTap={{ scale: 0.9 }}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <motion.div
                animate={{
                  rotate: isDarkMode ? [0, 360] : [360, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 0.5 }}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-[#ffd43b]" />
                ) : (
                  <Moon className="w-4 h-4 text-[#64748b]" />
                )}
              </motion.div>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;