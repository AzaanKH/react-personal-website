import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  const paragraphVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.3,
        duration: 0.8,
      }
    })
  };

  return (
    <section id="bio" className="section py-5">
      <div className="container">
        <motion.h2 
          className="section-title text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          About Me
        </motion.h2>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <motion.p
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={paragraphVariants}
            >
              Hello! I'm a recent Computer Science graduate from the University of
              Washington, eager to make my mark in the tech world. During my studies,
              I honed my skills in systems, and gained practical experience through
              various projects.
            </motion.p>
            <motion.p
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={paragraphVariants}
            >
              I'm passionate about distributed systems and systems in general, and
              I'm always excited to tackle new challenges that push the boundaries
              of what's possible with code. When I'm not coding, you can find me
              playing games as I am currently enjoying Elden Ring.
            </motion.p>
            <motion.p
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={paragraphVariants}
            >
              I'm looking forward to contributing my fresh perspective and enthusiasm
              to innovative projects in the tech industry. Let's connect and explore
              how we can create something amazing together!
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;