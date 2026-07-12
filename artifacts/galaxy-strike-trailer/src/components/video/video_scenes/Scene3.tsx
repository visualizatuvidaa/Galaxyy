import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),  // Ship enters
      setTimeout(() => setPhase(2), 1000), // Aliens appear
      setTimeout(() => setPhase(3), 2000), // Lasers & explosions
      setTimeout(() => setPhase(4), 3000), // Coins
      setTimeout(() => setPhase(5), 4500), // BOSS WARNING
      setTimeout(() => setPhase(6), 6000), // Exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 w-full h-full z-10 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.5, rotate: -10 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Ship */}
      <motion.img 
        src={`${import.meta.env.BASE_URL}images/ship.png`}
        alt="Ship"
        className="absolute bottom-[20%] w-32 object-contain filter drop-shadow-[0_0_15px_#00f7ff]"
        initial={{ y: 200, opacity: 0 }}
        animate={phase >= 1 ? { y: 0, opacity: 1, x: [-20, 20, -10, 0] } : {}}
        transition={{ y: { type: 'spring', stiffness: 200, damping: 20 }, x: { repeat: Infinity, duration: 2, ease: 'easeInOut' } }}
      />

      {/* Lasers */}
      {phase >= 2 && phase < 5 && (
        <motion.div 
          className="absolute bottom-[40%] w-2 h-[20vh] bg-secondary rounded-full filter drop-shadow-[0_0_10px_#00f7ff]"
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: -500, opacity: 0 }}
          transition={{ repeat: Infinity, duration: 0.3, ease: 'linear' }}
        />
      )}

      {/* Alien 1 */}
      <motion.img 
        src={`${import.meta.env.BASE_URL}images/alien.png`}
        alt="Alien"
        className="absolute top-[20%] left-[30%] w-24 object-contain filter drop-shadow-[0_0_15px_#bf00ff]"
        initial={{ y: -200, opacity: 0 }}
        animate={
          phase === 2 ? { y: 0, opacity: 1 } :
          phase >= 3 ? { scale: 1.5, opacity: 0, filter: 'blur(10px)' } : {}
        }
        transition={{ duration: 0.5 }}
      />

      {/* Alien 2 */}
      <motion.img 
        src={`${import.meta.env.BASE_URL}images/alien.png`}
        alt="Alien"
        className="absolute top-[30%] right-[30%] w-24 object-contain filter drop-shadow-[0_0_15px_#bf00ff]"
        initial={{ y: -200, opacity: 0 }}
        animate={
          phase === 2 ? { y: 0, opacity: 1 } :
          phase >= 3 ? { scale: 1.5, opacity: 0, filter: 'blur(10px)' } : {}
        }
        transition={{ duration: 0.5, delay: 0.2 }}
      />

      {/* Coins */}
      <motion.img 
        src={`${import.meta.env.BASE_URL}images/coin.png`}
        alt="Coin"
        className="absolute top-[25%] left-[30%] w-12 object-contain filter drop-shadow-[0_0_10px_#ffd700]"
        initial={{ scale: 0, opacity: 0, y: 0 }}
        animate={phase >= 3 ? { scale: [0, 1.2, 1], opacity: [0, 1, 0], y: 100, rotateY: 360 } : {}}
        transition={{ duration: 1, delay: 0.2 }}
      />
      <motion.img 
        src={`${import.meta.env.BASE_URL}images/coin.png`}
        alt="Coin"
        className="absolute top-[35%] right-[30%] w-12 object-contain filter drop-shadow-[0_0_10px_#ffd700]"
        initial={{ scale: 0, opacity: 0, y: 0 }}
        animate={phase >= 3 ? { scale: [0, 1.2, 1], opacity: [0, 1, 0], y: 100, rotateY: 360 } : {}}
        transition={{ duration: 1, delay: 0.4 }}
      />

      {/* Boss Warning */}
      <motion.div
        className="absolute inset-0 bg-error/20 z-20 flex items-center justify-center mix-blend-overlay pointer-events-none"
        initial={{ opacity: 0 }}
        animate={phase >= 5 ? { opacity: [0, 1, 0] } : {}}
        transition={{ repeat: Infinity, duration: 0.5 }}
      />
      <motion.h2
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-6xl md:text-8xl text-error font-black tracking-widest z-30 whitespace-nowrap"
        style={{ textShadow: '0 0 20px #ff0055' }}
        initial={{ opacity: 0, scale: 2 }}
        animate={phase >= 5 ? { opacity: [0, 1, 0], scale: 1 } : {}}
        transition={{ repeat: Infinity, duration: 0.5 }}
      >
        WARNING
      </motion.h2>

    </motion.div>
  );
}