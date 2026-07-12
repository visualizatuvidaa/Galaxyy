import React, { useState, useEffect } from 'react';
import { loadSave, saveGame, SaveData } from '../game/storage';
import { CONFIG } from '../game/config';

interface ShopScreenProps {
  onBack: () => void;
}

export default function ShopScreen({ onBack }: ShopScreenProps) {
  const [save, setSave] = useState<SaveData>(loadSave());
  const [tab, setTab] = useState<'upgrades' | 'ships' | 'premium'>('upgrades');

  const handleUpgrade = (key: keyof SaveData['upgrades']) => {
    const currentLevel = save.upgrades[key];
    const maxLevel = CONFIG.UPGRADES[key].levels.length;
    if (currentLevel >= maxLevel) return;
    
    const cost = CONFIG.UPGRADES[key].levels[currentLevel];
    if (save.coins >= cost) {
      const newSave = { ...save, coins: save.coins - cost, upgrades: { ...save.upgrades, [key]: currentLevel + 1 } };
      saveGame(newSave);
      setSave(newSave);
    }
  };

  const handleBuyShip = (shipKey: string) => {
    const ship = CONFIG.SHIPS[shipKey as keyof typeof CONFIG.SHIPS];
    if (save.unlockedShips.includes(shipKey)) {
      const newSave = { ...save, selectedShip: shipKey as any };
      saveGame(newSave);
      setSave(newSave);
      return;
    }
    
    if (ship.costType === 'coins' && save.coins >= ship.cost) {
      const newSave = { ...save, coins: save.coins - ship.cost, unlockedShips: [...save.unlockedShips, shipKey] };
      saveGame(newSave);
      setSave(newSave);
    } else if (ship.costType === 'gems' && save.gems >= ship.cost) {
      const newSave = { ...save, gems: save.gems - ship.cost, unlockedShips: [...save.unlockedShips, shipKey] };
      saveGame(newSave);
      setSave(newSave);
    }
  };

  return (
    <div className="w-full h-full bg-[#020818] flex flex-col p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pt-4">
        <button onClick={onBack} className="text-cyan-400 font-bold px-4 py-2 panel-bg rounded-lg">BACK</button>
        <div className="flex gap-4">
          <div className="panel-bg px-3 py-1 rounded-full flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_8px_#ffd700]" />
            <span className="text-yellow-400 font-bold">{save.coins}</span>
          </div>
          <div className="panel-bg px-3 py-1 rounded-full flex items-center gap-2">
            <div className="w-3 h-3 rotate-45 bg-cyan-400 shadow-[0_0_8px_#00f7ff]" />
            <span className="text-cyan-400 font-bold">{save.gems}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['upgrades', 'ships', 'premium'] as const).map(t => (
          <button 
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-bold uppercase rounded-lg border transition ${
              tab === t ? 'border-cyan-400 bg-cyan-900/40 text-cyan-400' : 'border-gray-800 text-gray-500 bg-transparent'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-8 space-y-4">
        {tab === 'upgrades' && Object.entries(CONFIG.UPGRADES).map(([key, data]) => {
          const level = save.upgrades[key as keyof SaveData['upgrades']];
          const maxLevel = data.levels.length;
          const cost = level < maxLevel ? data.levels[level] : 0;
          const isMax = level === maxLevel;
          const canAfford = save.coins >= cost;
          
          return (
            <div key={key} className="panel-bg p-4 rounded-xl flex items-center justify-between">
              <div className="flex-1">
                <div className="text-white font-bold uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                <div className="flex gap-1 mt-2">
                  {Array.from({length: maxLevel}).map((_, i) => (
                    <div key={i} className={`h-2 w-6 rounded-sm ${i < level ? 'bg-cyan-400 shadow-[0_0_5px_#00f7ff]' : 'bg-gray-800'}`} />
                  ))}
                </div>
              </div>
              <button 
                onClick={() => handleUpgrade(key as keyof SaveData['upgrades'])}
                disabled={isMax || !canAfford}
                className={`px-4 py-2 rounded font-bold ml-4 ${
                  isMax ? 'bg-gray-800 text-gray-500' : 
                  canAfford ? 'bg-yellow-500 text-black shadow-[0_0_10px_#ffd700]' : 'bg-gray-800 text-gray-400'
                }`}
              >
                {isMax ? 'MAX' : `${cost} C`}
              </button>
            </div>
          );
        })}

        {tab === 'ships' && Object.entries(CONFIG.SHIPS).map(([key, ship]) => {
          const isUnlocked = save.unlockedShips.includes(key);
          const isSelected = save.selectedShip === key;
          const canAfford = ship.costType === 'coins' ? save.coins >= ship.cost : save.gems >= ship.cost;
          
          return (
            <div key={key} className={`panel-bg p-4 rounded-xl border-2 ${isSelected ? 'border-cyan-400' : 'border-transparent'} relative overflow-hidden`}>
              <div className="flex justify-between items-start mb-2">
                <div className="text-xl text-white font-black uppercase tracking-widest">{ship.name}</div>
                <div className="text-xs text-gray-400">HP: {ship.hpMod}x / SPD: {ship.speedMod}x</div>
              </div>
              <p className="text-sm text-gray-400 mb-4">{ship.desc}</p>
              
              <button 
                onClick={() => handleBuyShip(key)}
                disabled={!isUnlocked && !canAfford}
                className={`w-full py-3 rounded font-bold uppercase ${
                  isSelected ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500' :
                  isUnlocked ? 'bg-gray-700 text-white' :
                  canAfford ? 'bg-purple-500 text-white shadow-[0_0_10px_#bf00ff]' : 'bg-gray-800 text-gray-500'
                }`}
              >
                {isSelected ? 'EQUIPPED' : 
                 isUnlocked ? 'EQUIP' : 
                 `${ship.cost} ${ship.costType === 'coins' ? 'COINS' : 'GEMS'}`}
              </button>
            </div>
          );
        })}
        
        {tab === 'premium' && (
          <div className="space-y-4">
            <div className="panel-bg p-6 rounded-xl border border-purple-500 flex flex-col items-center text-center">
              <div className="w-12 h-12 rotate-45 bg-cyan-400 shadow-[0_0_20px_#00f7ff] mb-4" />
              <h3 className="text-xl font-bold text-white mb-2 uppercase">Starter Pack</h3>
              <p className="text-gray-400 text-sm mb-4">5,000 Coins + 500 Gems + Phantom Ship</p>
              <button className="bg-white text-black px-8 py-3 rounded font-bold w-full">$2.99 - COMING SOON</button>
            </div>
            
            <div className="panel-bg p-6 rounded-xl flex flex-col items-center text-center">
              <h3 className="text-xl font-bold text-white mb-2 uppercase">Remove Ads</h3>
              <button className="bg-gray-800 text-gray-400 border border-gray-600 px-8 py-3 rounded font-bold w-full">COMING SOON</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
