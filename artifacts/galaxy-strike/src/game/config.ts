export const CONFIG = {
  CANVAS_WIDTH: 402,
  CANVAS_HEIGHT: 874,
  FPS: 60,
  PLAYER_BASE_HP: 100,
  PLAYER_BASE_SPEED: 420,
  PLAYER_BASE_FIRE_RATE: 260,
  PLAYER_BASE_DAMAGE: 10,

  COLORS: {
    BG: '#020818',
    CYAN: '#00f7ff',
    PURPLE: '#bf00ff',
    RED: '#ff3366',
    GOLD: '#ffd700',
    WHITE: '#ffffff',
  },

  // ─── Upgrades ──────────────────────────────────────────────────────────────
  UPGRADES: {
    fireRate: {
      label: 'Velocidad de Disparo',
      icon: '⚡',
      desc: 'Dispara más rápido',
      levels: [150, 300, 600, 1200, 2500],
      effect: (level: number) => Math.max(80, 260 - level * 44),
    },
    damage: {
      label: 'Daño',
      icon: '💥',
      desc: 'Más daño por disparo',
      levels: [150, 300, 700, 1400, 3000],
      effect: (level: number) => 10 + level * 6,
    },
    hp: {
      label: 'Escudo',
      icon: '🛡',
      desc: 'Más puntos de vida',
      levels: [200, 400, 800, 1600, 3500],
      effect: (level: number) => 100 + level * 60,
    },
    shield: {
      label: 'Armadura',
      icon: '🔰',
      desc: 'Reduce el daño recibido',
      levels: [500, 1000, 2500],
      effect: (level: number) => level * 0.1,
    },
    magnet: {
      label: 'Magneto',
      icon: '🧲',
      desc: 'Atrae monedas y gemas',
      levels: [300, 700, 1500],
      effect: (level: number) => 50 + level * 70,
    },
    speed: {
      label: 'Velocidad',
      icon: '🚀',
      desc: 'Muévete más rápido',
      levels: [200, 450, 900, 2000],
      effect: (level: number) => 420 + level * 80,
    },
    luck: {
      label: 'Suerte',
      icon: '🍀',
      desc: 'Más drops de enemigos',
      levels: [250, 600, 1200],
      effect: (level: number) => 0.3 + level * 0.15,
    },
  } as Record<string, { label: string; icon: string; desc: string; levels: number[]; effect: (l: number) => number }>,

  // ─── Weapon Upgrades ───────────────────────────────────────────────────────
  WEAPON_UPGRADES: [
    { level: 0, name: 'Láser Básico',    icon: '|',  desc: 'Disparo simple recto',          cost: 0    },
    { level: 1, name: 'Doble Disparo',   icon: '||', desc: 'Dos láseres paralelos',          cost: 600  },
    { level: 2, name: 'Triple Spread',   icon: '|||',desc: 'Tres láseres en abanico',        cost: 1400 },
    { level: 3, name: 'Misiles Laterales',icon: '🚀',desc: 'Agrega misiles a los lados',    cost: 2800 },
    { level: 4, name: 'Quad Devastador', icon: '✦', desc: 'Cuatro láseres + misiles',       cost: 5000 },
  ],

  // ─── Ships ──────────────────────────────────────────────────────────────────
  SHIPS: {
    viper:   { name: 'Viper',   cost: 0,    costType: 'coins', hpMod: 1.0, speedMod: 1.0, desc: 'Nave balanceada para empezar.' },
    phantom: { name: 'Phantom', cost: 500,  costType: 'gems',  hpMod: 0.7, speedMod: 1.4, desc: 'Rápida y mortal. Poca vida.' },
    titan:   { name: 'Titan',   cost: 1000, costType: 'gems',  hpMod: 1.6, speedMod: 0.8, desc: 'Lenta pero blindada. Triple disparo.' },
    shadow:  { name: 'Shadow',  cost: 2500, costType: 'coins', hpMod: 1.1, speedMod: 1.2, desc: 'Invisible por 3s tras recibir daño.' },
  },

  // ─── Skins ──────────────────────────────────────────────────────────────────
  SKINS: {
    default: { name: 'Azul Estelar', icon: '🔵', cost: 0,    costType: 'coins', bodyColor: '#2255cc', cockpitColor: '#00ccee', wingColor: '#1a3a8a', glowColor: '#00f7ff' },
    crimson: { name: 'Carmesí',      icon: '🔴', cost: 800,  costType: 'coins', bodyColor: '#cc2222', cockpitColor: '#ff8844', wingColor: '#881111', glowColor: '#ff3344' },
    gold:    { name: 'Dorado',       icon: '🟡', cost: 1500, costType: 'coins', bodyColor: '#aa7700', cockpitColor: '#ffdd44', wingColor: '#664400', glowColor: '#ffd700' },
    venom:   { name: 'Veneno',       icon: '🟢', cost: 1200, costType: 'coins', bodyColor: '#116622', cockpitColor: '#44ff88', wingColor: '#0a3d18', glowColor: '#00ff66' },
    purple:  { name: 'Nebulosa',     icon: '🟣', cost: 2000, costType: 'coins', bodyColor: '#551199', cockpitColor: '#cc44ff', wingColor: '#330066', glowColor: '#bf00ff' },
    ice:     { name: 'Glaciar',      icon: '⚪', cost: 2500, costType: 'coins', bodyColor: '#336688', cockpitColor: '#aaeeff', wingColor: '#1a3344', glowColor: '#88ddff' },
  } as Record<string, { name: string; icon: string; cost: number; costType: string; bodyColor: string; cockpitColor: string; wingColor: string; glowColor: string }>,
};
