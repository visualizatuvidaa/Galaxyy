import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { addCoins, addGems, loadSave } from '../game/storage';

interface GameOverProps {
  stats: { score: number; wave: number; coins: number; gems?: number; kills?: number };
  onRetry: () => void;
  onMenu: () => void;
}

export default function GameOver({ stats, onRetry, onMenu }: GameOverProps) {
  const [claimed, setClaimed] = useState(false);
  const save = loadSave();
  const isHighScore = stats.score > 0 && stats.score >= save.highScore;
  const isHighWave = stats.wave > 1 && stats.wave >= save.highWave;

  const handleClaim = () => {
    addCoins(stats.coins);
    if (stats.gems) addGems(stats.gems);
    setClaimed(true);
  };

  const handleShare = async () => {
    const text = `🚀 Galaxy Strike: Legacy\n🏆 Puntuación: ${stats.score}\n🌊 Oleada: ${stats.wave}\n💀 Enemigos: ${stats.kills ?? '?'}\n¡Intenta superarme!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Galaxy Strike: Legacy', text });
      } catch (_) {}
    } else {
      await navigator.clipboard.writeText(text);
      alert('¡Resultado copiado al portapapeles!');
    }
  };

  return (
    <div className="w-full h-full bg-[#020818] flex flex-col items-center justify-center p-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1a000880_0%,_#020818_70%)]" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="relative z-10 w-full max-w-sm flex flex-col items-center gap-5"
      >
        {/* Title */}
        <div className="text-center">
          <h1 className="text-5xl font-black text-red-400 tracking-widest"
              style={{ textShadow: '0 0 30px #ff3366, 0 0 60px #ff336644' }}>
            GAME OVER
          </h1>
          {(isHighScore || isHighWave) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-yellow-400 font-bold text-sm tracking-widest animate-pulse"
            >
              🏆 {isHighScore ? '¡NUEVO RÉCORD DE PUNTUACIÓN!' : '¡NUEVA OLEADA RÉCORD!'}
            </motion.div>
          )}
        </div>

        {/* Stats card */}
        <div className="w-full bg-[#0a1830] border border-cyan-500/20 rounded-2xl p-5 flex flex-col gap-3">
          {[
            { label: 'Puntuación Final', value: stats.score.toLocaleString(), color: 'text-white', glow: '#00f7ff' },
            { label: 'Oleada Alcanzada', value: `Oleada ${stats.wave}`, color: 'text-purple-400', glow: '#bf00ff' },
            { label: 'Enemigos Destruidos', value: stats.kills?.toLocaleString() ?? '—', color: 'text-red-400', glow: '#ff3366' },
          ].map(({ label, value, color, glow }) => (
            <div key={label} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
              <span className="text-gray-400 text-sm">{label}</span>
              <span className={`font-black text-lg ${color}`} style={{ textShadow: `0 0 10px ${glow}` }}>
                {value}
              </span>
            </div>
          ))}

          {/* Rewards row */}
          <div className="flex gap-3 pt-1">
            {stats.coins > 0 && (
              <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1.5 rounded-full">
                <span className="text-base">🪙</span>
                <span className="text-yellow-400 font-bold text-sm">+{stats.coins}</span>
              </div>
            )}
            {(stats.gems ?? 0) > 0 && (
              <div className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-full">
                <span className="text-base">💎</span>
                <span className="text-cyan-400 font-bold text-sm">+{stats.gems}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col w-full gap-3">
          {!claimed ? (
            <button
              onClick={handleClaim}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black
                         py-4 rounded-xl uppercase tracking-wider text-base active:scale-95 transition-transform
                         shadow-[0_0_20px_rgba(255,215,0,0.4)]"
            >
              🎁 RECLAMAR RECOMPENSAS
            </button>
          ) : (
            <div className="w-full bg-green-500/20 border border-green-500/40 text-green-400 font-bold
                            py-4 rounded-xl text-center text-base">
              ✓ Recompensas Reclamadas
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onRetry}
              className="flex-1 bg-cyan-500 text-black font-black py-3.5 rounded-xl
                         text-sm active:scale-95 transition-transform"
            >
              ▶ REINTENTAR
            </button>
            <button
              onClick={handleShare}
              className="flex-1 bg-purple-600 text-white font-bold py-3.5 rounded-xl
                         text-sm active:scale-95 transition-transform border border-purple-400/40"
            >
              📤 COMPARTIR
            </button>
          </div>

          <button
            onClick={onMenu}
            className="w-full text-gray-500 py-2 font-semibold text-sm"
          >
            Ir al Menú Principal
          </button>
        </div>
      </motion.div>
    </div>
  );
}
