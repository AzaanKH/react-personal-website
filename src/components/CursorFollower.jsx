import React, { useState, useRef, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';

const CursorFollower = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Use spring physics for smooth animation
  const springConfig = { damping: 25, stiffness: 120 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  useEffect(() => {
    x.set(mousePosition.x);
    y.set(mousePosition.y);
  }, [mousePosition, x, y]);
  
  return (
    <motion.div
      className="cursor-follower"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        x,
        y,
        translateX: '-50%',
        translateY: '-50%',
      }}
    >
      <motion.div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.5)',
          boxShadow: '0 0 20px 4px rgba(99, 102, 241, 0.3)',
        }}
        whileHover={{ scale: 1.5 }}
      />
    </motion.div>
  );
};

export default CursorFollower;