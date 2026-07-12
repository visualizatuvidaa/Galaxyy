import React, { useState } from 'react';
import { loadSave, SaveData } from '../game/storage';

interface AchievementsScreenProps {
  onBack: () => void;
}

const ACHIEVEMENTS_LIST = [
  { id: 'first_kill', title: 'First Kill', desc: 'Destroy your first enemy', target: 1, statKey: 'totalKills' },
  { id: 'wave_5', title: 'Wave Rider', desc: 'Reach Wave 5', target: 5, statKey: 'highWave' },
  { id: 'wave_10', title: 'Veteran', desc: 'Reach Wave 10', target: 10, statKey: 'highWave' },
  { id: 'wave_15', title: 'Legend', desc: 'Reach Wave 15', target: 15, statKey: 'highWave' },
  { id: 'coins_1k', title: 'Coin Collector', desc: 'Earn 1000 total coins', target: 1000, statKey: 'totalCoins' },
  { id: 'gems_50', title: 'Gem Hunter', desc: 'Find 50 gems', target: 50, statKey: 'totalGems' },
  { id: 'nukes_5', title: 'Nuke Master', desc: 'Use 5 Nukes', target: 5, statKey: 'totalNukes' },
];

export default function AchievementsScreen({ onBack }: AchievementsScreenProps) {
  const [save] = useState<SaveData>(loadSave());
  
  // mock for totalCoins since it wasn't explicitly in stats, fallback to current coins
  const getStat = (key: string) => {
    if (key === 'highWave') return save.highWave;
    if (key === 'totalCoins') return save.coins; 
    return save.stats[key as keyof SaveData['stats']] || 0;
  };

  return (
    <div className="w-full h-full bg-[#020818] flex flex-col p-4">
      <div className="flex justify-between items-center mb-6 pt-4">
        <button onClick={onBack} className="text-cyan-400 font-bold px-4 py-2 panel-bg rounded-lg">BACK</button>
        <h2 className="text-xl text-yellow-400 font-bold uppercase tracking-widest">Achievements</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-8 space-y-4">
        {ACHIEVEMENTS_LIST.map(ach => {
          const progress = getStat(ach.statKey);
          const completed = progress >= ach.target;
          const percent = Math.min(100, (progress / ach.target) * 100);
          
          return (
            <div key={ach.id} className={`panel-bg p-4 rounded-xl border ${completed ? 'border-yellow-500' : 'border-transparent'}`}>
              <div className="flex gap-4 items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${completed ? 'border-yellow-400 bg-yellow-400/20' : 'border-gray-600 bg-gray-800'}`}>
                  {completed ? (
                    <div className="w-6 h-6 border-2 border-yellow-400 rotate-45 shadow-[0_0_10px_#ffd700]" />
                  ) : (
                    <div className="w-6 h-6 border-2 border-gray-600 rotate-45" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold ${completed ? 'text-yellow-400' : 'text-white'}`}>{ach.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{ach.desc}</p>
                  
                  <div className="mt-3 w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${completed ? 'bg-yellow-400 shadow-[0_0_8px_#ffd700]' : 'bg-cyan-500'}`} 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="text-right text-[10px] text-gray-500 mt-1 font-mono">
                    {Math.min(progress, ach.target)} / {ach.target}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
