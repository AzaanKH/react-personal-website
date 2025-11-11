import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

// Updated project data with enhanced descriptions
const projectsData = [
  {
    id: 1,
    title: "Paxos Consensus Algorithm",
    description: "Designed and implemented a fault-tolerant distributed system using the Paxos consensus algorithm, ensuring consistency and replication across multiple nodes. Developed robust Java implementation handling each phase of the algorithm with comprehensive communication protocols.",
    githubUrl: null,
    demoUrl: null,
    tags: ["Java", "Distributed Systems", "Consensus Algorithm", "Fault Tolerance"],
    gradient: "linear-gradient(135deg, rgba(34, 139, 230, 0.1), rgba(34, 139, 230, 0.05))",
    icon: "fas fa-network-wired",
    iconColor: "#228BE6"
  },
  {
    id: 2,
    title: "NFL Fantasy Picker",
    description: "Developed a real-time Full Stack application using React and Node.js, dynamically predicting the top ten starting players and updating scores based on live data. Constructed and maintained an SQL database housing comprehensive data on 50+ NFL players with advanced analytics.",
    githubUrl: "https://github.com/AzaanKH/football",
    demoUrl: null,
    tags: ["Python", "SQL", "Data Analysis", "Machine Learning", "React"],
    gradient: "linear-gradient(135deg, rgba(40, 192, 87, 0.1), rgba(40, 192, 87, 0.05))",
    icon: "fas fa-chart-line",
    iconColor: "#28C057"
  },
  {
    id: 3,
    title: "Paxos vs Raft Analysis",
    description: "Comprehensive research and implementation comparison of Paxos and Raft consensus algorithms. Analyzed trade-offs between the two approaches, simulated both algorithms for sample workloads, and documented performance characteristics and use-case recommendations.",
    githubUrl: null,
    demoUrl: null,
    tags: ["Distributed Systems", "Algorithm Comparison", "Research", "Performance Analysis"],
    gradient: "linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 193, 7, 0.05))",
    icon: "fas fa-balance-scale",
    iconColor: "#FFC107"
  }
];

const Projects = () => {
  const { isDarkMode } = useTheme();
  const [hoveredProject, setHoveredProject] = useState(null);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        damping: 20, 
        stiffness: 150 
      }
    }
  };

  return (
    <section id="projects" className="section py-5">
      <div className="container">
        <motion.h2 
          className="section-title text-center"
          initial={{ opacity: 0, scale: 0.5, rotateX: -90 }}
          whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ 
            type: "spring", 
            damping: 15, 
            stiffness: 200,
            duration: 0.8 
          }}
        >
          Projects
        </motion.h2>
        
        <motion.div 
          className="projects-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
            marginTop: '3rem'
          }}
        >
          <AnimatePresence>
            {projectsData.map((project, index) => (
              <motion.div 
                key={project.id} 
                className="project-card"
                variants={cardVariants}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  boxShadow: isDarkMode 
                    ? `0 20px 40px rgba(0,0,0,0.4)`
                    : `0 15px 35px rgba(0,0,0,0.15)`,
                }}
                onHoverStart={() => setHoveredProject(project.id)}
                onHoverEnd={() => setHoveredProject(null)}
                style={{
                  background: `${project.gradient}, ${isDarkMode ? '#25262B' : '#ffffff'}`,
                  border: `1px solid ${isDarkMode ? '#2C2E33' : '#dee2e6'}`,
                  borderRadius: '16px',
                  padding: '2rem',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: isDarkMode 
                    ? '0 4px 12px rgba(0,0,0,0.3)' 
                    : '0 2px 8px rgba(0,0,0,0.1)',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Animated border effect */}
                <motion.div
                  className="position-absolute top-0 start-0 w-100 h-100"
                  style={{
                    background: `linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)`,
                    opacity: 0
                  }}
                  animate={hoveredProject === project.id ? {
                    opacity: [0, 1, 0],
                    x: ['-100%', '100%']
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />

                {/* Header with Icon */}
                <div className="d-flex align-items-center mb-3">
                  <motion.div 
                    className="me-3"
                    animate={hoveredProject === project.id ? {
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    whileHover={{ scale: 1.3 }}
                  >
                    <i 
                      className={project.icon} 
                      style={{ 
                        fontSize: '2.5rem', 
                        color: project.iconColor 
                      }}
                    ></i>
                  </motion.div>
                  
                  <motion.h3 
                    className="mb-0"
                    style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: '600',
                      color: isDarkMode ? '#C1C2C5' : '#1A1B1E'
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + (index * 0.1) }}
                  >
                    {project.title}
                  </motion.h3>
                </div>

                {/* Description */}
                <motion.p
                  style={{ 
                    color: isDarkMode ? '#A6A7AB' : '#373A40',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem'
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + (index * 0.1) }}
                >
                  {project.description}
                </motion.p>

                {/* Tags */}
                <motion.div 
                  className="d-flex flex-wrap gap-2 mb-3"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + (index * 0.1) }}
                >
                  {project.tags.map((tag, tagIndex) => (
                    <motion.span
                      key={tagIndex}
                      className="badge"
                      style={{
                        background: isDarkMode ? '#373A40' : '#F1F3F5',
                        color: isDarkMode ? '#C1C2C5' : '#1A1B1E',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}
                      initial={{ opacity: 0, scale: 0, rotate: -180 }}
                      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ 
                        delay: 0.5 + (index * 0.1) + (tagIndex * 0.05), 
                        type: "spring", 
                        stiffness: 200 
                      }}
                      whileHover={{ 
                        scale: 1.1, 
                        rotate: 5,
                        backgroundColor: project.iconColor,
                        color: '#fff'
                      }}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  className="d-flex gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + (index * 0.1) }}
                >
                  {project.githubUrl && (
                    <motion.a
                      href={project.githubUrl}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm"
                      style={{
                        background: isDarkMode ? '#2C2E33' : '#F8F9FA',
                        color: isDarkMode ? '#C1C2C5' : '#1A1B1E',
                        border: `1px solid ${isDarkMode ? '#373A40' : '#DEE2E6'}`,
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      whileHover={{ 
                        background: isDarkMode ? '#373A40' : '#E9ECEF',
                        scale: 1.05
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <i className="fab fa-github"></i>
                      View Code
                    </motion.a>
                  )}
                  
                  {project.demoUrl && (
                    <motion.a
                      href={project.demoUrl}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm"
                      style={{
                        background: project.iconColor,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      whileHover={{ 
                        brightness: 1.1,
                        scale: 1.05
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <i className="fas fa-external-link-alt"></i>
                      Live Demo
                    </motion.a>
                  )}
                  
                  {!project.githubUrl && !project.demoUrl && (
                    <motion.div
                      className="btn btn-sm"
                      style={{
                        background: isDarkMode ? '#373A40' : '#F1F3F5',
                        color: isDarkMode ? '#909296' : '#5C5F66',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        cursor: 'default'
                      }}
                    >
                      <i className="fas fa-graduation-cap me-2"></i>
                      Academic Project
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Enhanced responsive styles */}
        <style jsx>{`
          @media (max-width: 768px) {
            .projects-grid {
              grid-template-columns: 1fr !important;
              gap: 1.5rem !important;
            }
            
            .project-card {
              padding: 1.5rem !important;
            }
          }
          
          @media (max-width: 992px) and (min-width: 769px) {
            .projects-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }

          .project-card {
            position: relative;
            overflow: hidden;
          }

          .project-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.05), transparent);
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
          }

          .project-card:hover::before {
            opacity: 1;
          }
        `}</style>
      </div>
    </section>
  );
};

export default Projects;