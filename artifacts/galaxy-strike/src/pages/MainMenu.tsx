import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { loadSave } from '../game/storage';

type NavScreen = 'shop' | 'achievements' | 'missions' | 'leaderboard' | 'settings';

interface MainMenuProps {
  onPlay: () => void;
  onNavigate: (screen: NavScreen) => void;
}

export default function MainMenu({ onPlay, onNavigate }: MainMenuProps) {
  const [save, setSave] = useState(loadSave());
  const today = new Date().toISOString().split('T')[0];
  const hasDailyReward = save.dailyReward.lastClaimed !== today;
  const hasMissions = save.missions.date !== today || save.missions.items.some(m => !m.claimed && m.progress >= m.target);

  useEffect(() => { setSave(loadSave()); }, []);

  const navItems: { key: NavScreen; icon: string; label: string; color: string; badge?: boolean }[] = [
    { key: 'shop',         icon: '🛒', label: 'TIENDA',    color: 'border-cyan-400/60 text-cyan-400'    },
    { key: 'missions',     icon: '📋', label: 'MISIONES',  color: 'border-purple-400/60 text-purple-400', badge: hasMissions || hasDailyReward },
    { key: 'achievements', icon: '🏆', label: 'LOGROS',    color: 'border-yellow-400/60 text-yellow-400' },
    { key: 'leaderboard',  icon: '📊', label: 'RÉCORDS',   color: 'border-green-400/60 text-green-400'  },
    { key: 'settings',     icon: '⚙️', label: 'AJUSTES',  color: 'border-gray-400/60 text-gray-400'    },
  ];

  return (
    <div className="w-full h-full bg-[#020818] flex flex-col items-center relative overflow-hidden">

      {/* Animated star bg */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: (Math.random() * 2.5 + 0.5) + 'px',
              height: (Math.random() * 2.5 + 0.5) + 'px',
              top: (Math.random() * 100) + '%',
              left: (Math.random() * 100) + '%',
              opacity: Math.random() * 0.6 + 0.2,
              animationDuration: (Math.random() * 4 + 1) + 's',
            }}
          />
        ))}
      </div>

      {/* Top bar */}
      <div className="w-full flex justify-between items-center px-5 pt-10 pb-2 z-10">
        <button onClick={() => onNavigate('settings')}
          className="text-gray-500 text-xl p-2 rounded-xl hover:text-white transition-colors">
          ⚙️
        </button>
        <div className="flex gap-2">
          <div className="bg-[#0a1830] border border-yellow-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="text-base">🪙</span>
            <span className="text-yellow-400 font-bold text-sm">{save.coins.toLocaleString()}</span>
          </div>
          <div className="bg-[#0a1830] border border-cyan-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="text-base">💎</span>
            <span className="text-cyan-400 font-bold text-sm">{save.gems}</span>
          </div>
        </div>
      </div>

      {/* Stats ribbon */}
      {save.highScore > 0 && (
        <div className="w-full px-5 z-10">
          <div className="bg-[#0a1830]/80 border border-white/5 rounded-xl px-4 py-2 flex justify-between text-xs text-gray-400">
            <span>🏆 Récord: <span className="text-white font-bold">{save.highScore.toLocaleString()}</span></span>
            <span>🌊 Mejor Oleada: <span className="text-white font-bold">{save.highWave}</span></span>
          </div>
        </div>
      )}

      {/* Logo */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 py-4">
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="text-center mb-10"
        >
          <div className="text-7xl mb-2">🚀</div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-400 italic tracking-tighter leading-none"
              style={{ textShadow: '0 0 40px #00f7ff66' }}>
            GALAXY<br />STRIKE
          </h1>
          <h2 className="text-2xl font-black text-purple-400 tracking-[0.3em] mt-2"
              style={{ textShadow: '0 0 20px #bf00ff88' }}>
            LEGACY
          </h2>
        </motion.div>

        {/* Play button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onPlay}
          className="relative group mb-6"
        >
          <div className="absolute -inset-5 bg-cyan-500 rounded-full blur-2xl opacity-40 group-active:opacity-60 animate-pulse" />
          <div className="relative w-36 h-36 rounded-full border-4 border-cyan-400 flex items-center justify-center
                          bg-[#020818]/90 backdrop-blur shadow-[0_0_30px_#00f7ff66]">
            <span className="text-3xl font-black text-cyan-400 tracking-widest ml-2">JUGAR</span>
          </div>
        </motion.button>

        {hasDailyReward && (
          <motion.button
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            onClick={() => onNavigate('missions')}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black
                       px-6 py-3 rounded-full text-sm shadow-[0_0_20px_#ffd70066] mb-2"
          >
            🎁 ¡RECOMPENSA DIARIA DISPONIBLE!
          </motion.button>
        )}

        <p className="text-xs text-gray-600 font-mono mt-2">v1.1 LEGACY EDITION</p>
      </div>

      {/* Bottom nav grid */}
      <div className="w-full grid grid-cols-5 gap-2 px-4 pb-8 z-10">
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`bg-[#0a1830] border py-3 rounded-xl flex flex-col items-center gap-1
                        active:scale-95 transition-transform relative ${item.color}`}
          >
            {item.badge && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full
                               border border-[#020818] animate-pulse" />
            )}
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-[9px] font-black tracking-wider">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
