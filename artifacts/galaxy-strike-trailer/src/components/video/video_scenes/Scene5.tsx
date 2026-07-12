import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),  // Logo
      setTimeout(() => setPhase(2), 2000), // Thaguan Studio
      setTimeout(() => setPhase(3), 3200), // Tagline
      setTimeout(() => setPhase(4), 6000), // Compress to point
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 w-full h-full z-10 flex flex-col items-center justify-center overflow-hidden bg-primary"
      initial={{ opacity: 0, scale: 1.2 }}
      animate={
        phase === 4 ? { opacity: 0, scale: 0, filter: 'blur(20px)' } : { opacity: 1, scale: 1 }
      }
      exit={{ opacity: 0 }}
      transition={{ duration: phase === 4 ? 0.8 : 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-primary/60" />
      </div>

      <motion.div 
        className="z-10 flex flex-col items-center max-w-2xl w-full px-8"
        initial={{ y: 50, opacity: 0 }}
        animate={phase >= 1 ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/logo.jpeg`}
          alt="Galaxy Strike"
          className="w-64 md:w-[500px] h-auto rounded-xl shadow-[0_0_50px_rgba(191,0,255,0.5)] border border-accent/20 mb-8"
        />
      </motion.div>

      <motion.div
        className="z-10 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={phase >= 2 ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <h3 className="font-body text-xl md:text-2xl text-text-muted tracking-[0.4em] uppercase mb-4 whitespace-nowrap">
          Thaguan Studio
        </h3>
      </motion.div>

      <motion.div
        className="z-10 mt-6"
        initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
        animate={phase >= 3 ? { opacity: 1, filter: 'blur(0px)', y: 0 } : {}}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <p className="font-display text-2xl md:text-4xl text-secondary text-glow-cyan tracking-widest font-bold text-center whitespace-nowrap">
          THE LEGEND RETURNS.
        </p>
      </motion.div>

      {/* Point of light burst at the end */}
      {phase === 4 && (
        <motion.div 
          className="absolute inset-0 bg-white z-50 mix-blend-overlay"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 2] }}
          transition={{ duration: 0.8 }}
        />
      )}
    </motion.div>
  );
}