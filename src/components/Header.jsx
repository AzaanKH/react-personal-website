import React, { useState } from 'react';
import ContactForm from './ContactForm';

const Header = () => {
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <section className="header-section text-center">
      <div className="container">
        <h1 className="display-4 mb-4" id="azaan-khalfe">
          Azaan Khalfe
        </h1>
        <p>Computer Science Graduate | Systems Engineer</p>
        <div className="social-links mt-4">
          <a 
            href="https://github.com/AzaanKH" 
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-github"></i>
          </a>
          <a 
            href="https://www.linkedin.com/in/azaan-khalfe-43b90b221/" 
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-linkedin"></i>
          </a>
          <a onClick={() => setShowContactForm(true)} style={{ cursor: 'pointer' }}>
            <i className="fas fa-envelope"></i>
          </a>
        </div>
      </div>
      {showContactForm && <ContactForm onClose={() => setShowContactForm(false)} />}
    </section>
  );
};

export default Header;