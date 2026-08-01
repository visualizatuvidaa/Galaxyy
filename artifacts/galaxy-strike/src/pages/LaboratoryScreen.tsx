import React, { useState } from 'react';
import { loadSave, saveGame, SaveData } from '../game/storage';
import { CONFIG } from '../game/config';

interface Props { onBack: () => void; }

const LAB_UPGRADES = ['damage', 'speed', 'fireRate', 'shield', 'hp', 'coinIncome', 'criticalChance'] as const;
type LabUpgradeKey = (typeof LAB_UPGRADES)[number];

export default function LaboratoryScreen({ onBack }: Props) {
  const [save, setSave] = useState<SaveData>(loadSave());
  const [flash, setFlash] = useState<{ msg: string; ok: boolean } | null>(null);

  const showFlash = (msg: string, ok = true) => {
    setFlash({ msg, ok });
    setTimeout(() => setFlash(null), 1400);
  };

  const refresh = () => setSave(loadSave());

  const buyUpgrade = (key: LabUpgradeKey) => {
    const cfg = CONFIG.UPGRADES[key];
    const level = save.upgrades[key] ?? 0;
    if (level >= 20) return showFlash('Máximo nivel alcanzado', false);

    const cost = cfg.levels[level];
    const currency = cfg.costType === 'coins' ? save.coins : save.gems;
    if (currency < cost) return showFlash(`${cfg.costType === 'coins' ? 'Monedas' : 'Diamantes'} insuficientes`, false);

    const updates: Partial<SaveData> = {
      upgrades: { ...save.upgrades, [key]: level + 1 } as any,
    };

    if (cfg.costType === 'coins') updates.coins = save.coins - cost;
    else updates.gems = save.gems - cost;

    saveGame(updates);
    refresh();
    showFlash(`¡${cfg.label} mejorado al nivel ${level + 1}!`);
  };

  return (
    <div className="w-full h-full bg-[#020818] text-white overflow-hidden flex flex-col">
      {flash && (
        <div className="fixed inset-x-0 top-1/2 -translate-y-1/2 z-50 flex justify-center pointer-events-none">
          <div className={`px-6 py-3 rounded-2xl border backdrop-blur-md text-sm font-black ${flash.ok ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300' : 'bg-red-950/90 border-red-400 text-red-300'}`}>
            {flash.msg}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-4 pt-10 pb-4 shrink-0">
        <button onClick={onBack} className="bg-[#0a1830] border border-cyan-500/40 text-cyan-300 font-bold px-4 py-2.5 rounded-xl text-sm active:scale-95">
          ← Volver
        </button>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.45em] text-cyan-300">Laboratorio</div>
          <div className="text-xl font-black tracking-widest">NAVE ASTRAL</div>
        </div>
        <div className="flex gap-2">
          <div className="bg-[#0a1830] border border-yellow-500/30 px-2.5 py-1.5 rounded-xl flex items-center gap-1">
            <span>🪙</span><span className="text-yellow-400 font-bold text-sm">{save.coins.toLocaleString()}</span>
          </div>
          <div className="bg-[#0a1830] border border-cyan-500/30 px-2.5 py-1.5 rounded-xl flex items-center gap-1">
            <span>💎</span><span className="text-cyan-400 font-bold text-sm">{save.gems}</span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-950/60 via-slate-900/75 to-purple-950/70 p-4 shadow-[0_0_24px_rgba(0,247,255,0.12)]">
          <div className="text-xs uppercase tracking-[0.35em] text-cyan-300 mb-2">Perfeccionamiento permanente</div>
          <div className="text-sm text-gray-300">Mejora tu nave usando monedas y diamantes. Cada mejora tiene 20 niveles y se guarda automáticamente para futuras partidas.</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3">
        {LAB_UPGRADES.map((key) => {
          const cfg = CONFIG.UPGRADES[key];
          const level = save.upgrades[key] ?? 0;
          const max = 20;
          const isMax = level >= max;
          const cost = cfg.levels[level] ?? 0;
          const currency = cfg.costType === 'coins' ? save.coins : save.gems;
          const canAfford = currency >= cost;

          return (
            <div key={key} className="rounded-2xl border border-white/10 bg-[#0a1830]/90 p-4 shadow-[0_0_18px_rgba(0,0,0,0.28)]">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl border border-white/10">{cfg.icon}</div>
                  <div>
                    <div className="text-white font-black text-sm">{cfg.label}</div>
                    <div className="text-gray-400 text-xs">{cfg.desc}</div>
                  </div>
                </div>
                <div className="text-[10px] font-black text-cyan-300 bg-cyan-900/50 border border-cyan-400/40 px-2 py-1 rounded-full">Nivel {level}/20</div>
              </div>

              <div className="flex gap-1.5 mb-4">
                {Array.from({ length: max }).map((_, i) => (
                  <div key={i} className={`flex-1 h-2 rounded-full ${i < level ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,247,255,0.8)]' : 'bg-white/10'}`} />
                ))}
              </div>

              {!isMax && (
                <button onClick={() => buyUpgrade(key)} disabled={!canAfford} className={`w-full py-3 rounded-2xl font-black text-sm active:scale-95 transition-transform ${canAfford ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(0,247,255,0.35)]' : 'bg-white/5 text-white/35 border border-white/10'}`}>
                  {cfg.costType === 'coins' ? '🪙' : '💎'} {cost.toLocaleString()} {cfg.costType === 'coins' ? 'monedas' : 'diamantes'}
                </button>
              )}

              {isMax && (
                <div className="w-full py-3 rounded-2xl border border-cyan-400/40 bg-cyan-950/30 text-cyan-300 text-center font-black text-sm">MAXIMIZADO</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
