import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';
import SteamBentoCard from './SteamBentoCard';
import ContactFormShadcn from './ContactFormShadcn';
import { 
  User, 
  Code, 
  BookOpen, 
  Rocket, 
  Mail, 
  Github, 
  Linkedin,
  FileText
} from 'lucide-react';

const BentoAboutShadcn = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  
  // Reading progress - easy to update in one place
  const readingProgress = 15; // Update this percentage as you progress
  
  // Enhanced animation variants for the centerpiece
  const cardAnimations = {
    bio: {
      initial: { opacity: 0, rotateY: -90, scale: 0.5 },
      animate: { 
        opacity: 1, 
        rotateY: 0, 
        scale: 1,
        transition: { 
          type: "spring", 
          damping: 15, 
          stiffness: 200,
          delay: 0.1
        }
      },
      hover: { 
        scale: 1.02, 
        rotateY: 3,
        transition: { type: "spring", stiffness: 300 }
      }
    },
    skills: {
      initial: { opacity: 0, x: -100, rotate: -10 },
      animate: { 
        opacity: 1, 
        x: 0, 
        rotate: 0,
        transition: { 
          type: "spring", 
          damping: 20, 
          stiffness: 150,
          delay: 0.2
        }
      },
      hover: { 
        scale: 1.05, 
        rotate: 2,
        y: -12,
        transition: { type: "spring", stiffness: 400 }
      }
    },
    interests: {
      initial: { opacity: 0, scale: 0, rotate: 180 },
      animate: { 
        opacity: 1, 
        scale: 1, 
        rotate: 0,
        transition: { 
          type: "spring", 
          damping: 12, 
          stiffness: 180,
          delay: 0.3
        }
      },
      hover: { 
        scale: 1.08, 
        rotate: -3,
        transition: { type: "spring", stiffness: 350 }
      }
    },
    reading: {
      initial: { opacity: 0, y: 50, skewX: 10 },
      animate: { 
        opacity: 1, 
        y: 0, 
        skewX: 0,
        transition: { 
          type: "spring", 
          damping: 18, 
          stiffness: 160,
          delay: 0.35
        }
      },
      hover: { 
        scale: 1.03, 
        skewX: -1,
        y: -10,
        transition: { type: "spring", stiffness: 300 }
      }
    },
    goals: {
      initial: { opacity: 0, y: 100, skewY: 10 },
      animate: { 
        opacity: 1, 
        y: 0, 
        skewY: 0,
        transition: { 
          type: "spring", 
          damping: 18, 
          stiffness: 160,
          delay: 0.4
        }
      },
      hover: { 
        scale: 1.03, 
        skewY: -1,
        y: -10,
        transition: { type: "spring", stiffness: 300 }
      }
    },
    connect: {
      initial: { opacity: 0, scale: 0.3, y: 50 },
      animate: { 
        opacity: 1, 
        scale: 1, 
        y: 0,
        transition: { 
          type: "spring", 
          damping: 10, 
          stiffness: 120,
          delay: 0.5
        }
      },
      hover: { 
        scale: 1.05, 
        y: -15,
        rotateZ: 2,
        transition: { type: "spring", stiffness: 400 }
      }
    }
  };

  // Floating animation for icons
  const floatingAnimation = {
    y: [-5, 5, -5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  // Page turning animation for reading card
  const pageAnimation = {
    rotateY: [0, 5, -5, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  // Enhanced bento cards with integrated contact/resume
  const bentoCards = [
    {
      id: 'bio',
      title: 'Background',
      gridArea: 'bio',
      className: 'col-span-3',
      content: (
        <Card className="h-full border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <motion.div 
                className="mr-4"
                animate={hoveredCard === 'bio' ? floatingAnimation : {}}
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
              >
                <User className="w-10 h-10 text-primary" />
              </motion.div>
              <div>
                <motion.h3 
                  className="text-xl font-semibold text-card-foreground"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  Computer Science Graduate
                </motion.h3>
                <motion.p 
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                >
                  University of Washington
                </motion.p>
              </div>
            </div>
            <motion.p 
              className="text-sm leading-relaxed text-card-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              Recent CS graduate passionate about systems engineering and distributed computing. 
              Eager to contribute fresh perspectives to innovative tech projects and tackle challenging 
              problems in fault-tolerant systems.
            </motion.p>
          </CardContent>
        </Card>
      )
    },
    
    {
      id: 'skills',
      title: 'Technical Focus',
      gridArea: 'skills',
      className: 'col-span-1',
      content: (
        <Card className="h-full border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-500/10">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <motion.div 
                className="mr-3"
                animate={hoveredCard === 'skills' ? floatingAnimation : {}}
                whileHover={{ scale: 1.3, rotateY: 180 }}
                transition={{ duration: 0.4 }}
              >
                <Code className="w-8 h-8 text-green-500" />
              </motion.div>
              <motion.h3 
                className="text-lg font-semibold text-card-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                Distributed Systems
              </motion.h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {['Java', 'Systems Design', 'Algorithms', 'Networking'].map((skill, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: 1 + (index * 0.1), 
                    type: "spring", 
                    stiffness: 200 
                  }}
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 5,
                  }}
                >
                  <Badge variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                </motion.div>
              ))}
            </div>
            <motion.p 
              className="text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
            >
              Specialized in fault-tolerant systems and consensus algorithms.
            </motion.p>
          </CardContent>
        </Card>
      )
    },
    
    {
      id: 'interests',
      title: 'Gaming Profile',
      gridArea: 'interests',
      className: 'col-span-1',
      content: (
        <Card className="h-full border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-cyan-500/10">
          <CardContent className="p-0">
            <SteamBentoCard 
              isHovered={hoveredCard === 'interests'}
              onHover={() => setHoveredCard('interests')}
              onHoverEnd={() => setHoveredCard(null)}
            />
          </CardContent>
        </Card>
      )
    },

    {
      id: 'reading',
      title: 'Currently Reading',
      gridArea: 'reading',
      className: 'col-span-1',
      content: (
        <Card className="h-full border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-indigo-500/10">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <motion.div 
                className="mr-3"
                animate={hoveredCard === 'reading' ? pageAnimation : floatingAnimation}
                whileHover={{ scale: 1.3, rotateZ: 15 }}
                transition={{ duration: 0.4 }}
              >
                <BookOpen className="w-8 h-8 text-indigo-500" />
              </motion.div>
              <motion.h3 
                className="text-lg font-semibold text-card-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                Learning Journey
              </motion.h3>
            </div>
            
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <div>
                <h4 className="font-medium text-card-foreground text-sm">
                  System Design Interview Vol. 2
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  by Alex Xu
                </p>
              </div>
              <div className="flex items-center gap-3">
                <motion.div 
                  className="flex-1 h-2 bg-muted rounded-full overflow-hidden"
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${readingProgress}%` }}
                    transition={{ delay: 1.5, duration: 1.5, ease: "easeOut" }}
                  />
                </motion.div>
                <span className="text-xs text-muted-foreground font-medium">{readingProgress}%</span>
              </div>
              <motion.p 
                className="text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.5 }}
              >
                Deep-diving into advanced system design patterns and architecture principles.
              </motion.p>
            </motion.div>
          </CardContent>
        </Card>
      )
    },
    
    {
      id: 'goals',
      title: 'Professional Goals',
      gridArea: 'goals',
      className: 'col-span-3',
      content: (
        <Card className="h-full border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-yellow-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <motion.div 
                  className="mr-4"
                  animate={hoveredCard === 'goals' ? {
                    y: [-5, -15, -5],
                    rotate: [0, 10, -10, 0]
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  whileHover={{ scale: 1.4, rotate: 45 }}
                >
                  <Rocket className="w-8 h-8 text-yellow-500" />
                </motion.div>
                <div>
                  <motion.h3 
                    className="text-lg font-semibold text-card-foreground"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    Looking Forward
                  </motion.h3>
                  <motion.p 
                    className="text-sm text-card-foreground leading-relaxed"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                  >
                    Tackle challenging distributed system problems and push boundaries of what's possible with code. 
                    Ready to contribute to innovative projects.
                  </motion.p>
                </div>
              </div>
              
              {/* Integrated Resume Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.5 }}
              >
                <Button 
                  asChild
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-orange-500 hover:to-red-500 text-white border-none"
                  size="lg"
                >
                  <motion.a
                    href="/khalfe_azaan_resume_24.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                    whileHover={{ 
                      scale: 1.05,
                      y: -2
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FileText className="w-4 h-4" />
                    View Resume
                  </motion.a>
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      )
    },
    
    {
      id: 'connect',
      title: 'Let\'s Connect',
      gridArea: 'connect',
      className: 'col-span-3',
      content: (
        <Card className="h-full border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <motion.div 
                  className="mr-4"
                  animate={hoveredCard === 'connect' ? {
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  } : floatingAnimation}
                  transition={{ duration: 2, repeat: Infinity }}
                  whileHover={{ rotate: 720, scale: 1.4 }}
                >
                  <Mail className="w-8 h-8 text-purple-500" />
                </motion.div>
                <div>
                  <motion.h3 
                    className="text-lg font-semibold text-card-foreground"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1, duration: 0.5 }}
                  >
                    Let's Connect
                  </motion.h3>
                  <motion.p 
                    className="text-sm text-card-foreground"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                  >
                    Ready to explore how we can create something amazing together! Feel free to reach out.
                  </motion.p>
                </div>
              </div>
              
              {/* Enhanced Contact Options */}
              <motion.div
                className="flex gap-3 items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.5 }}
              >
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowContactForm(true)}
                  className="border-primary/20 hover:bg-primary hover:text-primary-foreground"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Mail className="w-4 h-4" />
                  </motion.div>
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  className="border-primary/20 hover:bg-blue-600 hover:text-white"
                >
                  <motion.a
                    href="https://www.linkedin.com/in/azaan-khalfe-43b90b221/"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Linkedin className="w-4 h-4" />
                  </motion.a>
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  className="border-primary/20 hover:bg-gray-800 hover:text-white"
                >
                  <motion.a
                    href="https://github.com/AzaanKH"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Github className="w-4 h-4" />
                  </motion.a>
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      )
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  return (
    <section id="bio" className="py-20 bg-background">
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
          About Me
        </motion.h2>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          style={{
            gridTemplateAreas: `
              "bio bio bio"
              "skills interests reading"
              "goals goals goals"
              "connect connect connect"
            `,
          }}
        >
          {bentoCards.map((card, _index) => (
            <motion.div
              key={card.id}
              className={cn(card.className)}
              variants={cardAnimations[card.id]}
              initial="initial"
              animate="animate"
              whileHover="hover"
              onHoverStart={() => setHoveredCard(card.id)}
              onHoverEnd={() => setHoveredCard(null)}
              style={{
                gridArea: card.gridArea,
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Animated border effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 pointer-events-none"
                animate={hoveredCard === card.id ? {
                  opacity: [0, 1, 0],
                  x: ['-100%', '100%']
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              
              {card.content}
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {/* Contact Form Modal */}
      <ContactFormShadcn 
        open={showContactForm} 
        onClose={() => setShowContactForm(false)} 
      />
    </section>
  );
};

export default BentoAboutShadcn;