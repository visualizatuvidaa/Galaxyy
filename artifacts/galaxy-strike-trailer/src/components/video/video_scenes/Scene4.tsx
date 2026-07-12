import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const FEATURES = [
  "6 ENEMY TYPES",
  "EPIC BOSS FIGHTS",
  "UNLOCK SHIPS & UPGRADES",
  "OFFLINE. ALWAYS READY."
];

export function Scene4() {
  const [phase, setPhase] = useState(-1);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(0), 500),
      setTimeout(() => setPhase(1), 1200),
      setTimeout(() => setPhase(2), 1900),
      setTimeout(() => setPhase(3), 2600),
      setTimeout(() => setPhase(4), 5000), // exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 w-full h-full z-10 flex flex-col items-center justify-center overflow-hidden bg-primary"
      initial={{ opacity: 0, rotateY: 90, transformPerspective: 1200 }}
      animate={{ opacity: 1, rotateY: 0 }}
      exit={{ opacity: 0, y: -100, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-col gap-6 md:gap-8 z-10 text-center w-full px-4">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={i}
            className="overflow-hidden w-full flex justify-center"
            initial={{ opacity: 0, x: -100, skewX: 20 }}
            animate={
              phase >= i 
                ? { opacity: 1, x: 0, skewX: 0 } 
                : { opacity: 0, x: -100, skewX: 20 }
            }
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <h3 className="font-display text-3xl md:text-5xl lg:text-7xl font-bold uppercase tracking-wide text-white whitespace-nowrap"
                style={{ 
                  textShadow: i % 2 === 0 ? '0 0 15px rgba(0,247,255,0.8)' : '0 0 15px rgba(191,0,255,0.8)',
                  color: i % 2 === 0 ? '#00f7ff' : '#bf00ff'
                }}>
              {feature}
            </h3>
          </motion.div>
        ))}
      </div>
      
      {/* Background kinetic grid */}
      <motion.div
        className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,247,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,247,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: 50, opacity: 0.5 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        style={{ transformPerspective: 500, rotateX: 60, scale: 2, transformOrigin: 'top center' }}
      />
    </motion.div>
  );
}