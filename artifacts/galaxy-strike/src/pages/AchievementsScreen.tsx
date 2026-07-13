import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { loadSave, SaveData } from '../game/storage';

interface Props { onBack: () => void; }

const ACHIEVEMENTS = [
  { id: 'first_kill',   title: 'Primera Sangre',  emoji: '💀', desc: 'Destruye tu primer enemigo',  target: 1,     statKey: 'totalKills'  },
  { id: 'kill_100',     title: 'Cazador',          emoji: '🎯', desc: 'Destruye 100 enemigos',        target: 100,   statKey: 'totalKills'  },
  { id: 'kill_1000',    title: 'Exterminador',     emoji: '☠️', desc: 'Destruye 1000 enemigos',      target: 1000,  statKey: 'totalKills'  },
  { id: 'wave_5',       title: 'Superviviente',    emoji: '🌊', desc: 'Llega a la Oleada 5',          target: 5,     statKey: 'highWave'    },
  { id: 'wave_10',      title: 'Veterano',         emoji: '⭐', desc: 'Llega a la Oleada 10',         target: 10,    statKey: 'highWave'    },
  { id: 'wave_20',      title: 'Leyenda',          emoji: '🏆', desc: 'Llega a la Oleada 20',         target: 20,    statKey: 'highWave'    },
  { id: 'score_10k',    title: 'Puntuador',        emoji: '💯', desc: 'Consigue 10,000 puntos',       target: 10000, statKey: 'highScore'   },
  { id: 'score_50k',    title: 'Pro Gamer',        emoji: '🎮', desc: 'Consigue 50,000 puntos',       target: 50000, statKey: 'highScore'   },
  { id: 'coins_1k',     title: 'Adinerado',        emoji: '🪙', desc: 'Recolecta 1,000 monedas',      target: 1000,  statKey: 'totalCoins'  },
  { id: 'coins_10k',    title: 'Millonario',       emoji: '💰', desc: 'Recolecta 10,000 monedas',     target: 10000, statKey: 'totalCoins'  },
  { id: 'gems_50',      title: 'Buscador de Gemas',emoji: '💎', desc: 'Encuentra 50 gemas',           target: 50,    statKey: 'totalGems'   },
  { id: 'nukes_5',      title: 'Nuke Master',      emoji: '💣', desc: 'Usa 5 Nukes',                  target: 5,     statKey: 'totalNukes'  },
  { id: 'waves_10c',    title: 'Imparable',        emoji: '🔥', desc: 'Completa 10 oleadas en total', target: 10,    statKey: 'totalWaves'  },
  { id: 'games_10',     title: 'Adicto',           emoji: '🕹️', desc: 'Juega 10 partidas',           target: 10,    statKey: 'totalGamesPlayed' },
];

export default function AchievementsScreen({ onBack }: Props) {
  const [save] = useState<SaveData>(loadSave());
  const [shared, setShared] = useState(false);

  const getStat = (key: string): number => {
    if (key === 'highWave') return save.highWave;
    if (key === 'highScore') return save.highScore;
    return (save.stats as any)[key] ?? 0;
  };

  const completed = ACHIEVEMENTS.filter(a => getStat(a.statKey) >= a.target);

  const handleShare = async () => {
    const names = completed.map(a => `${a.emoji} ${a.title}`).join('\n');
    const text = `🚀 Galaxy Strike: Legacy\n🏆 Logros desbloqueados: ${completed.length}/${ACHIEVEMENTS.length}\n\n${names}\n\n¡Juega y supérame!`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Mis Logros — Galaxy Strike', text }); } catch (_) {}
    } else {
      await navigator.clipboard.writeText(text);
      alert('¡Logros copiados al portapapeles!');
    }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="w-full h-full bg-[#020818] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-4 shrink-0">
        <button onClick={onBack}
          className="bg-[#0a1830] border border-cyan-500/40 text-cyan-400 font-bold px-4 py-2.5 rounded-xl text-sm active:scale-95 transition-transform">
          ← Volver
        </button>
        <div>
          <div className="text-white font-black text-lg tracking-widest text-center" style={{ textShadow: '0 0 12px #ffd700' }}>
            LOGROS
          </div>
          <div className="text-xs text-yellow-400 text-center">{completed.length} / {ACHIEVEMENTS.length}</div>
        </div>
        <button onClick={handleShare}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm active:scale-95 transition-transform border ${
            shared ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-purple-600/40 border-purple-400/40 text-purple-300'
          }`}>
          {shared ? '✓ ¡Listo!' : '📤 Compartir'}
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 mb-4 shrink-0">
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-yellow-400 rounded-full transition-all"
               style={{ width: `${(completed.length / ACHIEVEMENTS.length) * 100}%`, boxShadow: '0 0 8px #ffd700' }} />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3">
        {ACHIEVEMENTS.map((ach, i) => {
          const progress = getStat(ach.statKey);
          const done = progress >= ach.target;
          const pct = Math.min(100, (progress / ach.target) * 100);
          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`bg-[#0a1830] rounded-2xl p-4 border-2 transition-all ${
                done ? 'border-yellow-400/60 shadow-[0_0_12px_#ffd70033]' : 'border-white/5'
              }`}
            >
              <div className="flex gap-4 items-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border-2 ${
                  done ? 'border-yellow-400/60 bg-yellow-400/20' : 'border-white/10 bg-white/5 grayscale opacity-50'
                }`}>
                  {ach.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-black text-sm ${done ? 'text-yellow-400' : 'text-white/60'}`}>{ach.title}</h3>
                    {done && <span className="text-[10px] text-yellow-400 bg-yellow-400/20 border border-yellow-400/40 px-1.5 rounded-full font-bold">✓</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{ach.desc}</p>
                  <div className="mt-2 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${done ? 'bg-yellow-400' : 'bg-cyan-500'}`}
                         style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-right text-[10px] text-gray-600 mt-0.5 font-mono">
                    {Math.min(progress, ach.target).toLocaleString()} / {ach.target.toLocaleString()}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
