import React from 'react';
import { motion } from 'framer-motion';
import { addCoins } from '../game/storage';

interface GameOverProps {
  stats: { score: number, wave: number, coins: number };
  onRetry: () => void;
  onMenu: () => void;
}

export default function GameOver({ stats, onRetry, onMenu }: GameOverProps) {
  const handleClaim = () => {
    addCoins(stats.coins);
    onMenu();
  };

  return (
    <div className="w-full h-full bg-[#020818] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-[#020818] to-[#020818]"></div>
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8"
      >
        <h1 className="text-5xl font-black text-red-500 neon-text-red tracking-widest text-center">
          GAME OVER
        </h1>
        
        <div className="w-full panel-bg rounded-xl p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-cyan-500/30 pb-2">
            <span className="text-gray-400 uppercase text-sm">Final Score</span>
            <span className="text-2xl text-white font-bold neon-text-cyan">{stats.score}</span>
          </div>
          <div className="flex justify-between items-center border-b border-cyan-500/30 pb-2">
            <span className="text-gray-400 uppercase text-sm">Wave Reached</span>
            <span className="text-xl text-purple-400 font-bold neon-text-purple">{stats.wave}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-gray-400 uppercase text-sm">Coins Found</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-400 shadow-[0_0_10px_#ffd700]"></div>
              <span className="text-xl text-yellow-400 font-bold">+{stats.coins}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col w-full gap-4">
          <button 
            onClick={handleClaim}
            className="w-full bg-yellow-500 text-black font-black py-4 rounded-lg uppercase tracking-wider shadow-[0_0_20px_rgba(255,215,0,0.5)] active:scale-95 transition-transform"
          >
            CLAIM REWARDS
          </button>
          
          <div className="flex gap-4">
            <button 
              onClick={onRetry}
              className="flex-1 panel-bg text-cyan-400 font-bold py-3 rounded-lg border border-cyan-500 active:scale-95 transition-transform"
            >
              RETRY
            </button>
            <button 
              onClick={onMenu}
              className="flex-1 bg-transparent text-gray-400 font-bold py-3 rounded-lg active:scale-95 transition-transform"
            >
              MENU
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
