import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1000), // Pixel blinks
      setTimeout(() => setPhase(2), 2000), // Starfield appears with scanline
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 w-full h-full bg-primary z-10 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Blinking Pixel */}
      <motion.div 
        className="w-2 h-2 bg-white"
        initial={{ opacity: 0 }}
        animate={
          phase === 0 ? { opacity: 0 } :
          phase === 1 ? { opacity: [0, 1, 0, 1], scale: [1, 1.5, 1, 1] } :
          { scale: 500, opacity: 0 }
        }
        transition={{ duration: phase === 1 ? 0.8 : 0.4 }}
      />

      {/* 8-bit starfield and scanline explosion */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={phase >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5, ease: 'circOut' }}
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/pixel-stars.png`} 
          alt="Stars" 
          className="w-full h-full object-cover opacity-60 mix-blend-screen"
        />
        <motion.div 
          className="absolute inset-0 bg-white mix-blend-overlay"
          animate={phase === 2 ? { opacity: [1, 0, 0.5, 0] } : { opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
        
        {/* INSERT COIN text */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={phase >= 2 ? { opacity: [0, 1, 0] } : { opacity: 0 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <p className="font-display text-4xl text-secondary text-glow-cyan tracking-widest uppercase">
            INSERT COIN
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}