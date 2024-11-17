import React from 'react';

const Resume = () => {
  const pdfPath = '/khalfe_azaan_resume_24.pdf';
  return (
    <section id="resume" className="section py-5">
      <div className="container text-center">
        <h2 className="section-title">Resume</h2>
        <a
          href={pdfPath}
          className="btn resume-btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Resume
        </a>
      </div>
    </section>
  );
};

export default Resume;