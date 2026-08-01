import React, { useState } from 'react';
import { loadSave, saveGame, SaveData } from '../game/storage';
import { CONFIG } from '../game/config';

interface Props { onBack: () => void; }

type Tab = 'upgrades' | 'weapons' | 'ships' | 'skins' | 'premium';

const TAB_LIST: { key: Tab; icon: string; label: string }[] = [
  { key: 'upgrades', icon: '⚙️', label: 'Mejoras' },
  { key: 'weapons',  icon: '🔫', label: 'Armas'   },
  { key: 'ships',    icon: '🚀', label: 'Naves'   },
  { key: 'skins',    icon: '🎨', label: 'Skins'   },
  { key: 'premium',  icon: '👑', label: 'VIP'     },
];

export default function ShopScreen({ onBack }: Props) {
  const [save, setSave] = useState<SaveData>(loadSave());
  const [tab, setTab] = useState<Tab>('upgrades');
  const [flash, setFlash] = useState<{ msg: string; ok: boolean } | null>(null);

  const showFlash = (msg: string, ok = true) => {
    setFlash({ msg, ok });
    setTimeout(() => setFlash(null), 1300);
  };

  const refresh = () => setSave(loadSave());

  // ── Upgrade handler ────────────────────────────────────────────────────────
  const handleUpgrade = (key: string) => {
    const cfg = CONFIG.UPGRADES[key];
    if (!cfg) return;
    const level = (save.upgrades as any)[key] ?? 0;
    if (level >= cfg.levels.length) return showFlash('¡Ya está al máximo!', false);
    const cost = cfg.levels[level];
    if (save.coins < cost) return showFlash('Monedas insuficientes 😢', false);
    saveGame({ coins: save.coins - cost, upgrades: { ...save.upgrades, [key]: level + 1 } as any });
    refresh();
    showFlash(`¡${cfg.label} mejorado!`);
  };

  // ── Weapon upgrade handler ─────────────────────────────────────────────────
  const handleWeaponUpgrade = () => {
    const current = save.upgrades.weapon ?? 0;
    const next = CONFIG.WEAPON_UPGRADES[current + 1];
    if (!next) return showFlash('¡Arma al máximo!', false);
    if (save.coins < next.cost) return showFlash('Monedas insuficientes 😢', false);
    saveGame({ coins: save.coins - next.cost, upgrades: { ...save.upgrades, weapon: current + 1 } });
    refresh();
    showFlash(`¡${next.name} desbloqueada!`);
  };

  // ── Ship handler ───────────────────────────────────────────────────────────
  const handleShip = (key: string) => {
   const ship = CONFIG.SHIPS[key as keyof typeof CONFIG.SHIPS];
    if (!ship) return;
    if (save.selectedShip === key) return;
    if (save.unlockedShips.includes(key)) {
      saveGame({ selectedShip: key as any });
      refresh();
      return showFlash(`¡${ship.name} equipada!`);
    }
    const currency = ship.costType === 'coins' ? save.coins : save.gems;
    if (currency < ship.cost) return showFlash(`${ship.costType === 'coins' ? 'Monedas' : 'Gemas'} insuficientes 😢`, false);
    const updates: Partial<SaveData> = {
      unlockedShips: [...save.unlockedShips, key],
      selectedShip: key as any,
    };
    if (ship.costType === 'coins') updates.coins = save.coins - ship.cost;
    else updates.gems = save.gems - ship.cost;
    saveGame(updates);
    refresh();
    showFlash(`¡${ship.name} comprada!`);
  };

  // ── Skin handler ───────────────────────────────────────────────────────────
  const handleSkin = (key: string) => {
    const skin = CONFIG.SKINS[key];
    if (!skin) return;
    if (save.selectedSkin === key) return;
    if ((save.unlockedSkins ?? []).includes(key)) {
      saveGame({ selectedSkin: key });
      refresh();
      return showFlash(`¡Skin ${skin.name} equipada!`);
    }
    const currency = skin.costType === 'coins' ? save.coins : save.gems;
    if (currency < skin.cost) return showFlash('Monedas insuficientes 😢', false);
    const updates: Partial<SaveData> = {
      unlockedSkins: [...(save.unlockedSkins ?? []), key],
      selectedSkin: key,
    };
    if (skin.costType === 'coins') updates.coins = save.coins - skin.cost;
    else updates.gems = save.gems - skin.cost;
    saveGame(updates);
    refresh();
    showFlash(`¡Skin ${skin.name} desbloqueada!`);
  };

  const weaponLevel = save.upgrades.weapon ?? 0;

  return (
    <div className="w-full h-full bg-[#020818] flex flex-col">

      {/* Flash */}
      {flash && (
        <div className={`fixed inset-x-0 top-1/2 -translate-y-1/2 flex justify-center z-50 pointer-events-none`}>
          <div className={`px-6 py-3 rounded-2xl text-base font-bold text-center border backdrop-blur-md
            ${flash.ok
              ? 'bg-cyan-900/90 border-cyan-400/60 text-cyan-300 shadow-[0_0_20px_#00f7ff55]'
              : 'bg-red-900/90 border-red-400/60 text-red-300'}`}>
            {flash.msg}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-3 shrink-0">
        <button onClick={onBack}
          className="bg-[#0a1830] border border-cyan-500/40 text-cyan-400 font-bold px-4 py-2.5 rounded-xl text-sm active:scale-95 transition-transform">
          ← Volver
        </button>
        <div className="text-white font-black text-xl tracking-widest" style={{ textShadow: '0 0 12px #00f7ff' }}>
          TIENDA
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

      {/* Tabs */}
      <div className="flex gap-1.5 px-4 mb-4 shrink-0 overflow-x-auto pb-1">
        {TAB_LIST.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
              tab === t.key
                ? 'border-cyan-400 bg-cyan-900/50 text-cyan-400 shadow-[0_0_10px_#00f7ff33]'
                : 'border-white/10 bg-white/5 text-gray-400'
            }`}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-3">

        {/* ── UPGRADES ── */}
        {tab === 'upgrades' && Object.entries(CONFIG.UPGRADES).map(([key, cfg]) => {
          const level = (save.upgrades as any)[key] ?? 0;
          const max = cfg.levels.length;
          const isMax = level >= max;
          const cost = isMax ? 0 : cfg.levels[level];
          const canAfford = save.coins >= cost;
          return (
            <div key={key} className="bg-[#0a1830] border border-white/10 rounded-2xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cfg.icon}</span>
                  <div>
                    <div className="text-white font-black text-sm">{cfg.label}</div>
                    <div className="text-gray-500 text-xs">{cfg.desc}</div>
                  </div>
                </div>
                {isMax && (
                  <span className="text-[10px] font-black text-cyan-400 bg-cyan-900/50 border border-cyan-400/40 px-2 py-0.5 rounded-full">MAX</span>
                )}
              </div>
              {/* Level pips */}
              <div className="flex gap-1.5 mb-3">
                {Array.from({ length: max }).map((_, i) => (
                  <div key={i} className={`flex-1 h-2 rounded-full transition-all ${
                    i < level ? 'bg-cyan-400 shadow-[0_0_5px_#00f7ff]' : 'bg-white/10'
                  }`} />
                ))}
              </div>
              {!isMax && (
                <button onClick={() => handleUpgrade(key)} disabled={!canAfford}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2
                    active:scale-95 transition-transform ${
                    canAfford
                      ? 'bg-yellow-500 text-black shadow-[0_0_12px_#ffd70055]'
                      : 'bg-white/5 text-white/30 border border-white/10'
                  }`}>
                  <span>🪙</span>
                  <span>{cost.toLocaleString()} monedas</span>
                </button>
              )}
            </div>
          );
        })}

        {/* ── WEAPONS ── */}
        {tab === 'weapons' && (
          <>
            <div className="bg-[#0a1830] border border-white/10 rounded-2xl p-4 mb-2">
              <div className="text-xs text-gray-400 mb-1">Arma actual</div>
              <div className="text-white font-black text-lg">{CONFIG.WEAPON_UPGRADES[weaponLevel]?.name}</div>
              <div className="text-gray-400 text-sm">{CONFIG.WEAPON_UPGRADES[weaponLevel]?.desc}</div>
            </div>

            {CONFIG.WEAPON_UPGRADES.map((w, i) => {
              const isUnlocked = i <= weaponLevel;
              const isNext = i === weaponLevel + 1;
              const canAfford = save.coins >= w.cost;
              return (
                <div key={w.level} className={`bg-[#0a1830] border-2 rounded-2xl p-4 transition-all ${
                  isUnlocked && i === weaponLevel
                    ? 'border-cyan-400/60 shadow-[0_0_12px_#00f7ff22]'
                    : isUnlocked
                    ? 'border-white/20 opacity-60'
                    : isNext
                    ? 'border-yellow-500/50'
                    : 'border-white/5 opacity-40'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                      {w.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-black text-sm">{w.name}</span>
                        {isUnlocked && <span className="text-[10px] text-cyan-400 bg-cyan-900/50 border border-cyan-400/40 px-1.5 rounded-full font-bold">✓ Equipada</span>}
                      </div>
                      <div className="text-gray-400 text-xs mt-0.5">{w.desc}</div>
                    </div>
                  </div>

                  {/* Weapon level visual */}
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className={`flex-1 h-1.5 rounded-full ${j <= i ? 'bg-yellow-400' : 'bg-white/10'}`} />
                    ))}
                  </div>

                  {isNext && (
                    <button onClick={handleWeaponUpgrade} disabled={!canAfford}
                      className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2
                        active:scale-95 transition-transform ${
                        canAfford
                          ? 'bg-yellow-500 text-black shadow-[0_0_12px_#ffd70055]'
                          : 'bg-white/5 text-white/30 border border-white/10'
                      }`}>
                      <span>🪙</span>
                      <span>{w.cost.toLocaleString()} monedas para desbloquear</span>
                    </button>
                  )}
                  {!isUnlocked && !isNext && (
                    <div className="text-center text-xs text-gray-600 mt-1">🔒 Desbloquea el arma anterior primero</div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* ── SHIPS ── */}
        {tab === 'ships' && Object.entries(CONFIG.SHIPS).map(([key, ship]) => {
          const isUnlocked = save.unlockedShips.includes(key);
          const isSelected = save.selectedShip === key;
          const costIcon = ship.costType === 'coins' ? '🪙' : '💎';
          const currency = ship.costType === 'coins' ? save.coins : save.gems;
          const canAfford = currency >= ship.cost;
          return (
            <div key={key} className={`bg-[#0a1830] border-2 rounded-2xl overflow-hidden transition-all ${
              isSelected ? 'border-cyan-400/70 shadow-[0_0_16px_#00f7ff22]' : 'border-white/10'
            }`}>
              <div className="p-4 pb-3">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-white font-black text-xl uppercase tracking-widest">{ship.name}</span>
                  {isSelected && <span className="text-xs font-bold text-cyan-400 bg-cyan-900/60 border border-cyan-400/40 px-2 py-0.5 rounded-full">ACTIVA</span>}
                </div>
                <p className="text-gray-400 text-sm mb-3">{ship.desc}</p>
                <div className="flex gap-4 text-xs">
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-gray-500">Vida</div>
                    <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i < Math.round(ship.hpMod * 3) ? 'bg-red-400' : 'bg-white/10'}`} />)}</div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-gray-500">Vel</div>
                    <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i < Math.round(ship.speedMod * 3) ? 'bg-cyan-400' : 'bg-white/10'}`} />)}</div>
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4">
                <button onClick={() => handleShip(key)}
                  disabled={!isUnlocked && !canAfford}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2
                    active:scale-95 transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/60'
                      : isUnlocked
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : canAfford
                      ? 'bg-purple-600 text-white shadow-[0_0_14px_#bf00ff44]'
                      : 'bg-white/5 text-white/25 border border-white/10'
                  }`}>
                  {isSelected ? '✓ Equipada' : isUnlocked ? 'Equipar' : (
                    <><span>{costIcon}</span><span className={ship.costType === 'coins' ? 'text-yellow-400' : 'text-cyan-400'}>{ship.cost.toLocaleString()}</span><span className="text-white/60">{ship.costType === 'coins' ? 'monedas' : 'gemas'}</span></>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {/* ── SKINS ── */}
        {tab === 'skins' && (
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(CONFIG.SKINS).map(([key, skin]) => {
              const isUnlocked = (save.unlockedSkins ?? []).includes(key);
              const isSelected = (save.selectedSkin ?? 'default') === key;
              const canAfford = save.coins >= skin.cost;
              return (
                <div key={key} className={`bg-[#0a1830] border-2 rounded-2xl p-4 flex flex-col items-center transition-all ${
                  isSelected ? 'border-cyan-400/70 shadow-[0_0_12px_#00f7ff22]' : 'border-white/10'
                }`}>
                  {/* Preview */}
                  <div className="w-16 h-16 rounded-2xl mb-3 flex items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: skin.bodyColor + '33', border: `2px solid ${skin.glowColor}44` }}>
                    <div className="absolute inset-0" style={{ backgroundColor: skin.bodyColor, clipPath: 'polygon(50% 0%, 80% 100%, 20% 100%)', opacity: 0.8 }} />
                    <div className="absolute w-6 h-6 rounded-full" style={{ backgroundColor: skin.cockpitColor, top: '12px', boxShadow: `0 0 8px ${skin.glowColor}` }} />
                  </div>
                  <div className="text-white font-black text-xs text-center mb-1">{skin.name}</div>
                  {isSelected && <div className="text-[10px] text-cyan-400 mb-2 font-bold">✓ Activa</div>}
                  <button onClick={() => handleSkin(key)}
                    disabled={!isUnlocked && !canAfford}
                    className={`w-full py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1
                      active:scale-95 transition-all mt-auto ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        : isUnlocked
                        ? 'bg-white/10 text-white'
                        : canAfford
                        ? 'bg-yellow-500 text-black'
                        : 'bg-white/5 text-white/25 border border-white/10'
                    }`}>
                    {isSelected ? 'Activa' : isUnlocked ? 'Equipar' : (
                      <><span>🪙</span><span>{skin.cost.toLocaleString()}</span></>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ── PREMIUM ── */}
        {tab === 'premium' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-900/40 to-cyan-900/40 border border-purple-400/50 rounded-2xl p-6 flex flex-col items-center text-center shadow-[0_0_20px_#bf00ff22]">
              <div className="text-5xl mb-3">💎</div>
              <h3 className="text-xl font-black text-white mb-1 uppercase tracking-widest">Pack Inicial</h3>
              <p className="text-gray-400 text-sm mb-5">5,000 Monedas + 500 Gemas + Nave Shadow</p>
              <div className="w-full bg-white/5 border border-white/10 rounded-xl py-4 text-white/40 font-bold">
                $2.99 — PRÓXIMAMENTE
              </div>
            </div>
            <div className="bg-[#0a1830] border border-yellow-500/30 rounded-2xl p-6 flex flex-col items-center text-center">
              <div className="text-4xl mb-3">👑</div>
              <h3 className="text-xl font-black text-white mb-1">Pase VIP</h3>
              <p className="text-gray-400 text-sm mb-5">x2 monedas, skins exclusivos, sin esperas</p>
              <div className="w-full bg-white/5 border border-white/10 rounded-xl py-4 text-white/40 font-bold">
                $4.99/mes — PRÓXIMAMENTE
              </div>
            </div>
            <div className="bg-[#0a1830] border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center">
              <div className="text-4xl mb-3">🚫</div>
              <h3 className="text-xl font-black text-white mb-1">Sin Anuncios</h3>
              <div className="w-full bg-white/5 border border-white/10 rounded-xl py-4 text-white/40 font-bold mt-4">
                PRÓXIMAMENTE
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
