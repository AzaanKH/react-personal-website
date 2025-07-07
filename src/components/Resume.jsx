import React from 'react';
import { motion } from 'framer-motion';

const Resume = () => {
  const pdfPath = '/khalfe_azaan_resume_24.pdf';
  return (
    <section id="resume" className="section py-5">
      <div className="container text-center">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          Resume
        </motion.h2>
        <motion.a
          href={pdfPath}
          className="btn resume-btn"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          whileHover={{ 
            scale: 1.05, 
            boxShadow: "0 8px 20px rgba(0,123,255,0.4)"
          }}
          whileTap={{ scale: 0.95 }}
        >
          View Resume
        </motion.a>
      </div>
    </section>
  );
};

export default Resume;