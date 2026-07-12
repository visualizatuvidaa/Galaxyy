import React, { useState, useEffect } from 'react';
import { loadSave, saveGame, generateDailyMissions, SaveData } from '../game/storage';

interface MissionsScreenProps {
  onBack: () => void;
}

export default function MissionsScreen({ onBack }: MissionsScreenProps) {
  const [save, setSave] = useState<SaveData>(loadSave());
  const [showRewardModal, setShowRewardModal] = useState(false);

  useEffect(() => {
    generateDailyMissions();
    setSave(loadSave());
  }, []);

  const handleClaimReward = () => {
    const today = new Date().toISOString().split('T')[0];
    if (save.dailyReward.lastClaimed === today) return;

    let newStreak = save.dailyReward.streak;
    const last = new Date(save.dailyReward.lastClaimed);
    const curr = new Date(today);
    const diff = Math.floor((curr.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 1) newStreak++;
    else newStreak = 1;
    
    if (newStreak > 7) newStreak = 1;
    
    let coins = save.coins;
    let gems = save.gems;
    
    if (newStreak === 3) gems += 1;
    else if (newStreak === 5) gems += 2;
    else if (newStreak === 7) gems += 5;
    else coins += newStreak * 100;
    
    const newSave = { 
      ...save, 
      coins, gems, 
      dailyReward: { lastClaimed: today, streak: newStreak } 
    };
    saveGame(newSave);
    setSave(newSave);
    setShowRewardModal(false);
  };

  const handleClaimMission = (idx: number) => {
    const m = save.missions.items[idx];
    if (m.claimed || m.progress < m.target) return;
    
    let coins = save.coins;
    let gems = save.gems;
    if (m.rewardType === 'coins') coins += m.rewardAmount;
    if (m.rewardType === 'gems') gems += m.rewardAmount;
    
    const newItems = [...save.missions.items];
    newItems[idx].claimed = true;
    
    const newSave = { ...save, coins, gems, missions: { ...save.missions, items: newItems } };
    saveGame(newSave);
    setSave(newSave);
  };

  const today = new Date().toISOString().split('T')[0];
  const canClaimDaily = save.dailyReward.lastClaimed !== today;

  return (
    <div className="w-full h-full bg-[#020818] flex flex-col p-4 relative">
      <div className="flex justify-between items-center mb-6 pt-4">
        <button onClick={onBack} className="text-cyan-400 font-bold px-4 py-2 panel-bg rounded-lg">BACK</button>
        <h2 className="text-xl text-purple-400 font-bold uppercase tracking-widest">HQ TASKS</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-8 space-y-6">
        
        {/* Daily Reward Banner */}
        <div 
          onClick={() => canClaimDaily && setShowRewardModal(true)}
          className={`panel-bg p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer ${canClaimDaily ? 'border-yellow-400 bg-yellow-900/20' : 'border-gray-800'}`}
        >
          <div>
            <h3 className={`font-bold uppercase ${canClaimDaily ? 'text-yellow-400' : 'text-gray-500'}`}>Daily Login Reward</h3>
            <p className="text-xs text-gray-400 mt-1">Streak: {save.dailyReward.streak} days</p>
          </div>
          <button 
            disabled={!canClaimDaily}
            className={`px-4 py-2 rounded font-bold text-sm ${canClaimDaily ? 'bg-yellow-500 text-black shadow-[0_0_10px_#ffd700]' : 'bg-gray-800 text-gray-600'}`}
          >
            {canClaimDaily ? 'CLAIM' : 'CLAIMED'}
          </button>
        </div>

        {/* Missions */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">Daily Operations</h3>
          <div className="space-y-4">
            {save.missions.items.map((m, idx) => {
              // mock progress to allow UI to be seen if not playing
              const p = Math.min(m.target, m.progress || (idx === 0 ? m.target : 0)); 
              const completed = p >= m.target;
              
              return (
                <div key={m.id} className="panel-bg p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-white text-sm">{m.desc}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-gray-400">Reward:</span>
                        {m.rewardType === 'coins' ? (
                          <div className="w-2 h-2 rounded-full bg-yellow-400" />
                        ) : (
                          <div className="w-2 h-2 rotate-45 bg-cyan-400" />
                        )}
                        <span className={`text-xs font-bold ${m.rewardType==='coins'?'text-yellow-400':'text-cyan-400'}`}>
                          {m.rewardAmount}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleClaimMission(idx)}
                      disabled={!completed || m.claimed}
                      className={`px-3 py-1 rounded text-xs font-bold ${
                        m.claimed ? 'bg-transparent text-gray-600 border border-gray-700' :
                        completed ? 'bg-cyan-500 text-black shadow-[0_0_10px_#00f7ff]' : 'bg-gray-800 text-gray-500'
                      }`}
                    >
                      {m.claimed ? 'DONE' : completed ? 'CLAIM' : `${p}/${m.target}`}
                    </button>
                  </div>
                  {!m.claimed && (
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400" style={{ width: `${(p/m.target)*100}%` }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Reward Modal */}
      {showRewardModal && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 z-50">
          <h2 className="text-3xl font-black text-yellow-400 mb-8 neon-text-cyan tracking-widest text-center">LOGIN REWARD</h2>
          
          <div className="grid grid-cols-4 gap-2 w-full max-w-sm mb-8">
            {[1,2,3,4,5,6,7].map(d => {
              const current = save.dailyReward.streak + 1;
              const isToday = d === current || (d === 1 && current > 7);
              const isPast = d < current && current <= 7;
              
              return (
                <div key={d} className={`panel-bg p-2 rounded-lg border flex flex-col items-center justify-center aspect-square ${
                  isToday ? 'border-yellow-400 bg-yellow-900/30' : 
                  isPast ? 'border-green-500 opacity-50' : 'border-gray-800'
                }`}>
                  <span className="text-[10px] text-gray-400 mb-1">Day {d}</span>
                  {d === 3 || d === 5 || d === 7 ? (
                    <div className="w-4 h-4 rotate-45 bg-cyan-400 shadow-[0_0_5px_#00f7ff]" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-yellow-400 shadow-[0_0_5px_#ffd700]" />
                  )}
                </div>
              )
            })}
          </div>
          
          <button 
            onClick={handleClaimReward}
            className="w-full max-w-sm bg-yellow-500 text-black font-black py-4 rounded-lg uppercase tracking-wider shadow-[0_0_20px_rgba(255,215,0,0.5)] active:scale-95 transition-transform"
          >
            COLLECT
          </button>
        </div>
      )}
    </div>
  );
}
