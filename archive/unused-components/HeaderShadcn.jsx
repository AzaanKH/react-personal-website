import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Github, Linkedin, Mail } from 'lucide-react';
import ContactForm from './ContactForm';

const HeaderShadcn = () => {
  const [showContactForm, setShowContactForm] = useState(false);

  // Progressive reveal animation sequence
  const headerSequence = {
    name: {
      initial: { opacity: 0, y: -30 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.8, ease: "easeOut" }
    },
    subtitle: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, delay: 0.3, ease: "easeOut" }
    },
    social: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.5, delay: 0.6, ease: "easeOut" }
    },
    indicator: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, delay: 1.5, ease: "easeOut" }
    }
  };

  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 text-center">
        {/* Gradient background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        
        {/* Quick name introduction */}
        <motion.h1 
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground"
          id="azaan-khalfe"
          {...headerSequence.name}
        >
          Azaan Khalfe
        </motion.h1>
        
        {/* Clean subtitle */}
        <motion.p 
          className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
          {...headerSequence.subtitle}
        >
          Computer Science Graduate | Systems Engineering Enthusiast | Ready to Build Innovative Solutions
        </motion.p>

        {/* Social Links */}
        <motion.div 
          className="flex justify-center items-center gap-4 mb-12"
          {...headerSequence.social}
        >
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
            onClick={() => setShowContactForm(true)}
          >
            <motion.div
              whileHover={{ scale: 1.2, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
            >
              <Mail className="h-5 w-5" />
            </motion.div>
          </Button>

          <Button
            variant="outline"
            size="icon"
            asChild
            className="h-12 w-12 rounded-full border-primary/20 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300"
          >
            <motion.a
              href="https://www.linkedin.com/in/azaan-khalfe-43b90b221/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -3 }}
              whileTap={{ scale: 0.9 }}
            >
              <Linkedin className="h-5 w-5" />
            </motion.a>
          </Button>

          <Button
            variant="outline"
            size="icon"
            asChild
            className="h-12 w-12 rounded-full border-primary/20 hover:bg-gray-800 hover:text-white hover:border-gray-800 transition-all duration-300"
          >
            <motion.a
              href="https://github.com/AzaanKH"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -3 }}
              whileTap={{ scale: 0.9 }}
            >
              <Github className="h-5 w-5" />
            </motion.a>
          </Button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          className="flex flex-col items-center text-muted-foreground"
          {...headerSequence.indicator}
        >
          <small className="text-xs uppercase tracking-wider mb-2">Scroll to explore</small>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-8 bg-gradient-to-b from-primary to-transparent rounded-full"
          />
        </motion.div>
      </div>
      
      {/* Contact Form Modal */}
      {showContactForm && <ContactForm onClose={() => setShowContactForm(false)} />}
    </section>
  );
};

export default HeaderShadcn;