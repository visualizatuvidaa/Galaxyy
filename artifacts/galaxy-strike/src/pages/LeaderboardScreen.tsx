import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { loadSave } from '../game/storage';

interface Props { onBack: () => void; }

export default function LeaderboardScreen({ onBack }: Props) {
  const save = loadSave();
  const [shared, setShared] = useState(false);

  // Local "leaderboard" based on save stats
  const entries = [
    { rank: 1, name: 'TÚ 👑', score: save.highScore, wave: save.highWave, isPlayer: true },
    // Mock global entries scaled relative to player score
    { rank: 2, name: 'StarKiller',  score: Math.floor(save.highScore * 1.18 + 12400), wave: save.highWave + 3, isPlayer: false },
    { rank: 3, name: 'NovaCrush',   score: Math.floor(save.highScore * 1.05 + 8200),  wave: save.highWave + 2, isPlayer: false },
    { rank: 4, name: 'AstroBlaze',  score: Math.floor(save.highScore * 0.91 + 5100),  wave: save.highWave + 1, isPlayer: false },
    { rank: 5, name: 'DriftKing',   score: Math.floor(save.highScore * 0.78 + 3800),  wave: save.highWave,     isPlayer: false },
    { rank: 6, name: 'CosmicAce',   score: Math.floor(save.highScore * 0.65 + 2600),  wave: save.highWave - 1, isPlayer: false },
    { rank: 7, name: 'VoidHunter',  score: Math.floor(save.highScore * 0.52 + 1900),  wave: save.highWave - 1, isPlayer: false },
    { rank: 8, name: 'NebulaPilot', score: Math.floor(save.highScore * 0.42 + 1100),  wave: save.highWave - 2, isPlayer: false },
    { rank: 9, name: 'StarChaser',  score: Math.floor(save.highScore * 0.31 + 700),   wave: Math.max(1, save.highWave - 3), isPlayer: false },
    { rank: 10,name: 'SpaceCadet', score: Math.floor(save.highScore * 0.2 + 400),    wave: Math.max(1, save.highWave - 4), isPlayer: false },
  ].sort((a, b) => b.score - a.score).map((e, i) => ({ ...e, rank: i + 1 }));

  const handleShare = async () => {
    const playerRank = entries.findIndex(e => e.isPlayer) + 1;
    const text = `🚀 Galaxy Strike: Legacy\n📊 Mi posición: #${playerRank}\n🏆 Puntuación: ${save.highScore.toLocaleString()}\n🌊 Mejor Oleada: ${save.highWave}\n¡Supérame si puedes!`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Galaxy Strike — Récords', text }); } catch (_) {}
    } else {
      await navigator.clipboard.writeText(text);
      alert('¡Copiado al portapapeles!');
    }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const rankColors = ['text-yellow-400', 'text-gray-300', 'text-orange-400'];
  const rankEmojis = ['🥇', '🥈', '🥉'];

  return (
    <div className="w-full h-full bg-[#020818] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-4 shrink-0">
        <button onClick={onBack}
          className="bg-[#0a1830] border border-cyan-500/40 text-cyan-400 font-bold px-4 py-2.5 rounded-xl text-sm active:scale-95 transition-transform">
          ← Volver
        </button>
        <div className="text-white font-black text-lg tracking-widest" style={{ textShadow: '0 0 12px #00ff88' }}>
          RÉCORDS
        </div>
        <button onClick={handleShare}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm active:scale-95 transition-transform border ${
            shared ? 'bg-green-500/20 border-green-400/40 text-green-400' : 'bg-purple-600/40 border-purple-400/40 text-purple-300'
          }`}>
          {shared ? '✓' : '📤'}
        </button>
      </div>

      {/* Player stats card */}
      <div className="px-4 mb-4 shrink-0">
        <div className="bg-gradient-to-r from-cyan-900/40 to-purple-900/40 border border-cyan-400/30 rounded-2xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-gray-400 mb-1">TU MEJOR PUNTUACIÓN</div>
              <div className="text-3xl font-black text-white" style={{ textShadow: '0 0 15px #00f7ff' }}>
                {save.highScore.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-1">MEJOR OLEADA</div>
              <div className="text-3xl font-black text-purple-400" style={{ textShadow: '0 0 15px #bf00ff' }}>
                {save.highWave}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2">
        {entries.map((entry, i) => (
          <motion.div
            key={entry.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
              entry.isPlayer
                ? 'bg-cyan-900/30 border-cyan-400/50 shadow-[0_0_12px_#00f7ff22]'
                : 'bg-[#0a1830] border-white/5'
            }`}
          >
            {/* Rank */}
            <div className={`w-10 text-center font-black text-xl ${rankColors[entry.rank - 1] ?? 'text-gray-500'}`}>
              {entry.rank <= 3 ? rankEmojis[entry.rank - 1] : `#${entry.rank}`}
            </div>

            {/* Name */}
            <div className="flex-1">
              <div className={`font-bold text-sm ${entry.isPlayer ? 'text-cyan-400' : 'text-white'}`}>{entry.name}</div>
              <div className="text-xs text-gray-500">Oleada {Math.max(1, entry.wave)}</div>
            </div>

            {/* Score */}
            <div className={`font-black text-base ${entry.isPlayer ? 'text-cyan-300' : rankColors[entry.rank - 1] ?? 'text-gray-400'}`}>
              {entry.score.toLocaleString()}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
