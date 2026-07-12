import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { easings } from '@/lib/video/animations';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500), // Logo reveals
      setTimeout(() => setPhase(2), 1500), // GALAXY STRIKE explodes
      setTimeout(() => setPhase(3), 2200), // LEGACY slides in
      setTimeout(() => setPhase(4), 5000), // Start exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 w-full h-full z-10 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 2, filter: 'blur(20px)' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background Energy Ring */}
      <motion.div 
        className="absolute w-[60vw] h-[60vw] rounded-full border border-accent/30"
        initial={{ scale: 0, opacity: 0 }}
        animate={phase >= 1 ? { scale: [0, 1.5], opacity: [0, 0.5, 0] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div 
        className="absolute w-[80vw] h-[80vw] rounded-full border border-secondary/20"
        initial={{ scale: 0, opacity: 0 }}
        animate={phase >= 1 ? { scale: [0, 1.2], opacity: [0, 0.3, 0] } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: 1 }}
      />

      {/* Hero Asset Reveal */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center opacity-40 mix-blend-lighten pointer-events-none"
        initial={{ filter: 'blur(20px) contrast(200%)', scale: 1.5, opacity: 0 }}
        animate={
          phase >= 1 ? { filter: 'blur(0px) contrast(100%)', scale: 1, opacity: 0.4 } : {}
        }
        transition={{ duration: 1.5, ease: easings.expoOut.ease }}
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/logo.jpeg`}
          alt="Galaxy Strike"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Typography */}
      <div className="relative z-20 flex flex-col items-center">
        <motion.h1 
          className="font-display text-7xl md:text-[8vw] font-black text-white tracking-tighter text-glow-cyan leading-none text-center"
          initial={{ opacity: 0, scale: 3, y: 50, filter: 'blur(20px)' }}
          animate={phase >= 2 ? { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, scale: 3 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          GALAXY<br/>STRIKE
        </motion.h1>

        <motion.div
          className="mt-4 px-8 py-2 border-y-2 border-accent bg-accent/10 backdrop-blur-sm"
          initial={{ opacity: 0, x: -100, clipPath: 'inset(0 100% 0 0)' }}
          animate={phase >= 3 ? { opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)' } : {}}
          transition={{ duration: 0.8, ease: easings.expoOut.ease }}
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold text-accent tracking-[0.3em] text-glow-purple">
            LEGACY
          </h2>
        </motion.div>
      </div>

    </motion.div>
  );
}