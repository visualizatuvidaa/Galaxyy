import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { loadSave } from '../game/storage';

interface MainMenuProps {
  onPlay: () => void;
  onNavigate: (screen: 'shop' | 'achievements' | 'missions') => void;
}

export default function MainMenu({ onPlay, onNavigate }: MainMenuProps) {
  const [save, setSave] = useState(loadSave());
  
  useEffect(() => {
    setSave(loadSave());
  }, []);

  return (
    <div className="w-full h-full bg-[#020818] flex flex-col justify-between items-center p-6 relative overflow-hidden">
      {/* CSS Stars Background */}
      <div className="absolute inset-0 opacity-50 pointer-events-none">
         {Array.from({length: 50}).map((_, i) => (
           <div 
             key={i} 
             className="absolute bg-white rounded-full animate-pulse"
             style={{
               width: Math.random() * 3 + 'px',
               height: Math.random() * 3 + 'px',
               top: Math.random() * 100 + '%',
               left: Math.random() * 100 + '%',
               animationDuration: (Math.random() * 3 + 1) + 's'
             }}
           />
         ))}
      </div>

      {/* Top Bar */}
      <div className="w-full flex justify-end gap-4 z-10 pt-4">
        <div className="panel-bg px-4 py-1 rounded-full flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_8px_#ffd700]" />
          <span className="text-yellow-400 font-bold text-sm">{save.coins}</span>
        </div>
        <div className="panel-bg px-4 py-1 rounded-full flex items-center gap-2">
          <div className="w-3 h-3 rotate-45 bg-cyan-400 shadow-[0_0_8px_#00f7ff]" />
          <span className="text-cyan-400 font-bold text-sm">{save.gems}</span>
        </div>
      </div>

      {/* Center Logo & Play */}
      <div className="flex flex-col items-center z-10">
        <motion.div 
          animate={{ y: [0, -10, 0] }} 
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-400 neon-text-cyan italic tracking-tighter">
            GALAXY<br/>STRIKE
          </h1>
          <h2 className="text-2xl font-bold text-purple-400 neon-text-purple tracking-widest mt-2">
            LEGACY
          </h2>
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onPlay}
          className="relative group"
        >
          <div className="absolute -inset-4 bg-cyan-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 animate-pulse transition"></div>
          <div className="relative w-32 h-32 rounded-full border-4 border-cyan-400 flex items-center justify-center bg-[#020818]/80 backdrop-blur">
            <span className="text-3xl font-black text-cyan-400 tracking-widest ml-2">PLAY</span>
          </div>
        </motion.button>
        
        <p className="mt-8 text-xs text-gray-500 font-mono">v1.0 LEGACY EDITION</p>
      </div>

      {/* Bottom Nav */}
      <div className="w-full grid grid-cols-3 gap-4 z-10 pb-4">
        <button onClick={() => onNavigate('shop')} className="panel-bg py-4 rounded-xl flex flex-col items-center gap-2 active:scale-95 transition">
          <div className="w-6 h-6 border-2 border-cyan-400 rounded-sm" />
          <span className="text-xs font-bold text-cyan-400 tracking-wider">SHOP</span>
        </button>
        <button onClick={() => onNavigate('missions')} className="panel-bg py-4 rounded-xl flex flex-col items-center gap-2 active:scale-95 transition relative">
          {save.missions.date !== new Date().toISOString().split('T')[0] && (
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping" />
          )}
          <div className="w-6 h-6 border-2 border-purple-400 rounded-full" />
          <span className="text-xs font-bold text-purple-400 tracking-wider">TASKS</span>
        </button>
        <button onClick={() => onNavigate('achievements')} className="panel-bg py-4 rounded-xl flex flex-col items-center gap-2 active:scale-95 transition">
          <div className="w-6 h-6 border-2 border-yellow-400 rotate-45" />
          <span className="text-xs font-bold text-yellow-400 tracking-wider">AWARDS</span>
        </button>
      </div>
    </div>
  );
}
