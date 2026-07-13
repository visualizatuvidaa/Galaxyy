import React, { useState } from 'react';
import { loadSave, saveGame, SaveData } from '../game/storage';
import { CONFIG } from '../game/config';

interface ShopScreenProps {
  onBack: () => void;
}

const UPGRADE_LABELS: Record<string, string> = {
  fireRate: 'Velocidad de Disparo',
  damage:   'Daño',
  hp:       'Escudo',
  shield:   'Armadura',
  magnet:   'Magneto',
};

export default function ShopScreen({ onBack }: ShopScreenProps) {
  const [save, setSave] = useState<SaveData>(loadSave());
  const [tab, setTab] = useState<'upgrades' | 'ships' | 'premium'>('upgrades');
  const [flash, setFlash] = useState<string | null>(null);

  const showFlash = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(null), 1200);
  };

  const handleUpgrade = (key: keyof SaveData['upgrades']) => {
    const currentLevel = save.upgrades[key];
    const maxLevel = CONFIG.UPGRADES[key].levels.length;
    if (currentLevel >= maxLevel) return;
    const cost = CONFIG.UPGRADES[key].levels[currentLevel];
    if (save.coins >= cost) {
      const newSave = { ...save, coins: save.coins - cost, upgrades: { ...save.upgrades, [key]: currentLevel + 1 } };
      saveGame(newSave);
      setSave(newSave);
      showFlash('¡Mejora comprada!');
    } else {
      showFlash('Monedas insuficientes');
    }
  };

  const handleBuyShip = (shipKey: string) => {
    const ship = CONFIG.SHIPS[shipKey as keyof typeof CONFIG.SHIPS];
    if (save.unlockedShips.includes(shipKey)) {
      const newSave = { ...save, selectedShip: shipKey as any };
      saveGame(newSave);
      setSave(newSave);
      showFlash('¡Nave equipada!');
      return;
    }
    if (ship.costType === 'coins' && save.coins >= ship.cost) {
      const newSave = { ...save, coins: save.coins - ship.cost, unlockedShips: [...save.unlockedShips, shipKey] };
      saveGame(newSave);
      setSave(newSave);
      showFlash('¡Nave comprada!');
    } else if (ship.costType === 'gems' && save.gems >= ship.cost) {
      const newSave = { ...save, gems: save.gems - ship.cost, unlockedShips: [...save.unlockedShips, shipKey] };
      saveGame(newSave);
      setSave(newSave);
      showFlash('¡Nave comprada!');
    } else {
      showFlash('¡No tienes suficiente!');
    }
  };

  return (
    <div className="w-full h-full bg-[#020818] flex flex-col">
      {/* Flash message */}
      {flash && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                        bg-black/90 border border-cyan-400 text-cyan-400 font-bold
                        px-6 py-3 rounded-xl text-center text-lg pointer-events-none
                        shadow-[0_0_20px_#00f7ff]">
          {flash}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-4 shrink-0">
        <button
          onClick={onBack}
          className="bg-[#0a1830] border border-cyan-500/50 text-cyan-400
                     font-bold px-5 py-2.5 rounded-xl text-sm active:scale-95 transition-transform"
        >
          ← VOLVER
        </button>

        <div className="text-white font-black text-xl tracking-widest uppercase"
             style={{ textShadow: '0 0 12px #00f7ff' }}>
          TIENDA
        </div>

        {/* Currency */}
        <div className="flex gap-2">
          <div className="bg-[#0a1830] border border-yellow-500/40 px-3 py-2 rounded-xl
                          flex items-center gap-1.5 min-w-[72px]">
            <span className="text-lg leading-none">🪙</span>
            <span className="text-yellow-400 font-bold text-sm">{save.coins.toLocaleString()}</span>
          </div>
          <div className="bg-[#0a1830] border border-cyan-500/40 px-3 py-2 rounded-xl
                          flex items-center gap-1.5 min-w-[60px]">
            <span className="text-lg leading-none">💎</span>
            <span className="text-cyan-400 font-bold text-sm">{save.gems}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 mb-4 shrink-0">
        {(['upgrades', 'ships', 'premium'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs font-bold uppercase rounded-xl border transition-all ${
              tab === t
                ? 'border-cyan-400 bg-cyan-900/40 text-cyan-400 shadow-[0_0_12px_#00f7ff44]'
                : 'border-white/10 text-gray-500 bg-white/5'
            }`}
          >
            {t === 'upgrades' ? '⚙️ Mejoras' : t === 'ships' ? '🚀 Naves' : '👑 Premium'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-3">

        {/* ── Upgrades ── */}
        {tab === 'upgrades' && Object.entries(CONFIG.UPGRADES).map(([key, data]) => {
          const level = save.upgrades[key as keyof SaveData['upgrades']];
          const maxLevel = data.levels.length;
          const cost = level < maxLevel ? data.levels[level] : 0;
          const isMax = level === maxLevel;
          const canAfford = save.coins >= cost;
          const label = UPGRADE_LABELS[key] ?? key;

          return (
            <div key={key} className="bg-[#0a1830] border border-white/10 rounded-2xl p-4">
              {/* Top row: label + MAX badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-bold text-sm uppercase tracking-wide">{label}</span>
                {isMax && (
                  <span className="text-xs font-black text-cyan-400 bg-cyan-900/50 border border-cyan-400/50
                                   px-2 py-0.5 rounded-full">
                    MAX
                  </span>
                )}
              </div>

              {/* Progress bars */}
              <div className="flex gap-1.5 mb-3">
                {Array.from({ length: maxLevel }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-2.5 rounded-full transition-all ${
                      i < level
                        ? 'bg-cyan-400 shadow-[0_0_6px_#00f7ff]'
                        : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>

              {/* Buy button */}
              {!isMax && (
                <button
                  onClick={() => handleUpgrade(key as keyof SaveData['upgrades'])}
                  disabled={!canAfford}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2
                              transition-all active:scale-95 ${
                    canAfford
                      ? 'bg-yellow-500 text-black shadow-[0_0_14px_#ffd70066] hover:bg-yellow-400'
                      : 'bg-white/5 text-white/30 border border-white/10'
                  }`}
                >
                  <span className="text-base leading-none">🪙</span>
                  <span>{cost.toLocaleString()} monedas</span>
                </button>
              )}
            </div>
          );
        })}

        {/* ── Ships ── */}
        {tab === 'ships' && Object.entries(CONFIG.SHIPS).map(([key, ship]) => {
          const isUnlocked = save.unlockedShips.includes(key);
          const isSelected = save.selectedShip === key;
          const canAfford = ship.costType === 'coins' ? save.coins >= ship.cost : save.gems >= ship.cost;
          const costIcon = ship.costType === 'coins' ? '🪙' : '💎';
          const costColor = ship.costType === 'coins' ? 'text-yellow-400' : 'text-cyan-400';

          return (
            <div
              key={key}
              className={`bg-[#0a1830] rounded-2xl border-2 overflow-hidden transition-all ${
                isSelected ? 'border-cyan-400 shadow-[0_0_16px_#00f7ff44]' : 'border-white/10'
              }`}
            >
              {/* Ship header */}
              <div className="p-4 pb-3">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-white font-black text-lg uppercase tracking-widest">{ship.name}</span>
                  {isSelected && (
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-900/60 border border-cyan-400/40
                                     px-2 py-0.5 rounded-full">EQUIPADA</span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-3">{ship.desc}</p>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>❤️ Vida ×{ship.hpMod}</span>
                  <span>⚡ Vel ×{ship.speedMod}</span>
                </div>
              </div>

              {/* CTA */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => handleBuyShip(key)}
                  disabled={!isUnlocked && !canAfford}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2
                               transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/60'
                      : isUnlocked
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : canAfford
                      ? 'bg-purple-600 text-white shadow-[0_0_14px_#bf00ff66] hover:bg-purple-500'
                      : 'bg-white/5 text-white/30 border border-white/10'
                  }`}
                >
                  {isSelected ? (
                    '✓ Equipada'
                  ) : isUnlocked ? (
                    'Equipar'
                  ) : (
                    <>
                      <span className="text-base leading-none">{costIcon}</span>
                      <span className={costColor}>{ship.cost.toLocaleString()}</span>
                      <span className="text-white/60">
                        {ship.costType === 'coins' ? 'monedas' : 'gemas'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {/* ── Premium ── */}
        {tab === 'premium' && (
          <div className="space-y-4">
            <div className="bg-[#0a1830] border border-purple-500/60 rounded-2xl p-6 flex flex-col items-center text-center
                            shadow-[0_0_20px_#bf00ff33]">
              <div className="text-5xl mb-3">💎</div>
              <h3 className="text-xl font-black text-white mb-1 uppercase tracking-widest">Pack Inicial</h3>
              <p className="text-gray-400 text-sm mb-5">5,000 Monedas + 500 Gemas + Nave Phantom</p>
              <button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white
                                 py-4 rounded-xl font-black text-base tracking-wider opacity-60">
                $2.99 — PRÓXIMAMENTE
              </button>
            </div>

            <div className="bg-[#0a1830] border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center">
              <div className="text-4xl mb-3">🚫</div>
              <h3 className="text-xl font-black text-white mb-1 uppercase">Sin Anuncios</h3>
              <button className="w-full bg-white/5 text-white/30 border border-white/10
                                 py-4 rounded-xl font-bold mt-4 opacity-60">
                PRÓXIMAMENTE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
