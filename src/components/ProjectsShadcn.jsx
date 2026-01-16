import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import { useTheme } from '../context/ThemeContext'; // Unused for now
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Github, ExternalLink, GraduationCap, Network, TrendingUp, Scale } from 'lucide-react';

// Updated project data with enhanced descriptions and lucide icons
const projectsData = [
  {
    id: 1,
    title: "Paxos Consensus Algorithm",
    description: "Designed and implemented a fault-tolerant distributed system using the Paxos consensus algorithm, ensuring consistency and replication across multiple nodes. Developed robust Java implementation handling each phase of the algorithm with comprehensive communication protocols.",
    githubUrl: null,
    demoUrl: null,
    tags: ["Java", "Distributed Systems", "Consensus Algorithm", "Fault Tolerance"],
    gradient: "linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.05))",
    icon: Network,
    iconColor: "hsl(var(--primary))"
  },
  {
    id: 2,
    title: "NFL Fantasy Picker",
    description: "Architected a multi-source data pipeline with automatic fallback orchestration (Sleeper API → ESPN API → web scraping), processing 11,400+ player records. Designed PostgreSQL + TimescaleDB schema for time-series statistics across 17 weeks × 3 seasons. Built automated sync infrastructure with APScheduler and implemented comprehensive test suite (104 tests) achieving 80%+ coverage.",
    githubUrl: "https://github.com/AzaanKH/football",
    demoUrl: null,
    tags: ["React", "Python", "Flask", "PostgreSQL", "TimescaleDB"],
    gradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))",
    icon: TrendingUp,
    iconColor: "#22c55e"
  },
  {
    id: 3,
    title: "Paxos vs Raft Analysis",
    description: "Comprehensive research and implementation comparison of Paxos and Raft consensus algorithms. Analyzed trade-offs between the two approaches, simulated both algorithms for sample workloads, and documented performance characteristics and use-case recommendations.",
    githubUrl: null,
    demoUrl: null,
    tags: ["Distributed Systems", "Algorithm Comparison", "Research", "Performance Analysis"],
    gradient: "linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(249, 115, 22, 0.05))",
    icon: Scale,
    iconColor: "#f97316"
  }
];

const ProjectsShadcn = () => {
  // const { isDarkMode } = useTheme(); // Unused for now
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
    <section id="projects" className="py-20" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-4xl font-bold text-center text-foreground mb-12"
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <AnimatePresence>
            {projectsData.map((project, index) => {
              const IconComponent = project.icon;
              return (
                <motion.div 
                  key={project.id}
                  variants={cardVariants}
                  whileHover={{ 
                    y: -10,
                    scale: 1.02,
                  }}
                  onHoverStart={() => setHoveredProject(project.id)}
                  onHoverEnd={() => setHoveredProject(null)}
                  className="group"
                >
                  <Card className="h-full border-border/50 bg-gradient-to-br from-card via-card to-muted/20 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                    {/* Animated border effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 pointer-events-none rounded-lg"
                      animate={hoveredProject === project.id ? {
                        opacity: [0, 1, 0],
                        x: ['-100%', '100%']
                      } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />

                    <CardHeader className="pb-4">
                      {/* Header with Icon */}
                      <div className="flex items-center mb-3">
                        <motion.div 
                          className="mr-3"
                          animate={hoveredProject === project.id ? {
                            rotate: [0, 360],
                            scale: [1, 1.2, 1]
                          } : {}}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          whileHover={{ scale: 1.3 }}
                        >
                          <IconComponent 
                            className="w-10 h-10"
                            style={{ color: project.iconColor }}
                          />
                        </motion.div>
                        
                        <CardTitle className="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors">
                          {project.title}
                        </CardTitle>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {/* Description */}
                      <motion.p
                        className="text-muted-foreground text-sm leading-relaxed mb-4"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + (index * 0.1) }}
                      >
                        {project.description}
                      </motion.p>

                      {/* Tags */}
                      <motion.div 
                        className="flex flex-wrap gap-2 mb-4"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + (index * 0.1) }}
                      >
                        {project.tags.map((tag, tagIndex) => (
                          <motion.div
                            key={tagIndex}
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
                            }}
                          >
                            <Badge 
                              variant="secondary" 
                              className="text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
                            >
                              {tag}
                            </Badge>
                          </motion.div>
                        ))}
                      </motion.div>

                      {/* Action Buttons */}
                      <motion.div
                        className="flex gap-2"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 + (index * 0.1) }}
                      >
                        {project.githubUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <motion.a
                              href={project.githubUrl}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Github className="w-4 h-4" />
                              View Code
                            </motion.a>
                          </Button>
                        )}
                        
                        {project.demoUrl && (
                          <Button
                            size="sm"
                            asChild
                            className="flex-1"
                            style={{ backgroundColor: project.iconColor }}
                          >
                            <motion.a
                              href={project.demoUrl}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <ExternalLink className="w-4 h-4" />
                              Live Demo
                            </motion.a>
                          </Button>
                        )}
                        
                        {!project.githubUrl && !project.demoUrl && (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled
                            className="flex-1 cursor-default"
                          >
                            <GraduationCap className="w-4 h-4 mr-2" />
                            Academic Project
                          </Button>
                        )}
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsShadcn;