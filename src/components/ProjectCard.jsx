import React from 'react';

const ProjectCard = ({ title, description }) => {
  return (
    <div className="card project-card">
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default ProjectCard;