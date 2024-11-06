import React from 'react';
import ProjectCard from './ProjectCard';

const projectsData = [
  {
    title: "Paxos",
    description: "Designed and implemented a fault-tolerant distributed system using the Paxos consensus algorithm, ensuring consistency and replication across multiple nodes. Developed code in Java to handle each phase of the algorithm and implemented communication protocols for nodes to reach a consensus."
  },
  {
    title: "NFL Fantasy Picker",
    description: "Developed a real-time Full Stack application using React and Node.js, dynamically predicting the top ten starting players and updating scores based on real-time data. Constructed and maintained an SQL database housing comprehensive data on 50 NFL players."
  },
  {
    title: "Comparing Paxos to Raft",
    description: "Explained how to implement Paxos and Raft and the trade-offs between the two, simulating them for a sample workload to compare their operation."
  }
];

const Projects = () => {
  return (
    <section id="projects" className="section py-5">
      <div className="container">
        <h2 className="section-title text-center">Projects</h2>
        <div className="row">
          {projectsData.map((project, index) => (
            <div key={index} className="col-md-4 mb-4">
              <ProjectCard {...project} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;