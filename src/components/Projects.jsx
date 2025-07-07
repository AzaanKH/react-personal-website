import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from './ProjectCard';

// Updated project data with GitHub URLs and custom tags
const projectsData = [
  {
    id: 1,
    title: "Paxos",
    description: "Designed and implemented a fault-tolerant distributed system using the Paxos consensus algorithm, ensuring consistency and replication across multiple nodes. Developed code in Java to handle each phase of the algorithm and implemented communication protocols for nodes to reach a consensus.",
    githubUrl:null, // Replace with your actual GitHub URL
    demoUrl: null, // If there's no demo, set to null
    tags: ["Java", "Distributed Systems", "Consensus Algorithm"]
  },
  {
    id: 2,
    title: "NFL Fantasy Picker",
    description: "Developed a real-time Full Stack application using React and Node.js, dynamically predicting the top ten starting players and updating scores based on real-time data. Constructed and maintained an SQL database housing comprehensive data on 50 NFL players.",
    githubUrl: "https://github.com/AzaanKH/football", // Replace with your actual GitHub URL
    demoUrl: null, // Replace with your actual demo URL or set to null
    tags: ["Python", "SQL", "Data Analysis", "Machine Learning"]
  },
  {
    id: 3,
    title: "Comparing Paxos to Raft",
    description: "Explained how to implement Paxos and Raft and the trade-offs between the two, simulating them for a sample workload to compare their operation.",
    githubUrl: null, // Replace with your actual GitHub URL
    demoUrl: null,
    tags: ["Distributed Systems", "Algorithm Comparison"]
  }
];

const Projects = () => {
  const [visibleProjects, setVisibleProjects] = useState(projectsData);
  
  // Function to shuffle projects (for demo purpose of layout animations)
  const shuffleProjects = () => {
    setVisibleProjects([...visibleProjects].sort(() => Math.random() - 0.5));
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <section id="projects" className="section py-5">
      <div className="container">
        <motion.h2 
          className="section-title text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          layout
        >
          Projects
        </motion.h2>
        
        {/* Shuffle button for demo purposes */}
        <motion.div 
          className="text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button 
            className="btn btn-primary btn-sm"
            onClick={shuffleProjects}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Shuffle Projects
          </motion.button>
        </motion.div>
        
        <motion.div 
          className="row"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          layout
        >
          <AnimatePresence>
            {visibleProjects.map((project) => (
              <motion.div 
                key={project.id} 
                className="col-md-4 mb-4"
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
              >
                <ProjectCard 
                  title={project.title}
                  description={project.description}
                  githubUrl={project.githubUrl}
                  demoUrl={project.demoUrl}
                  tags={project.tags}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;