export const CONFIG = {
  CANVAS_WIDTH: 402, // Reference mobile width
  CANVAS_HEIGHT: 874,
  FPS: 60,
  PLAYER_BASE_HP: 100,
  PLAYER_BASE_SPEED: 400, // px per sec
  PLAYER_BASE_FIRE_RATE: 250, // ms
  PLAYER_BASE_DAMAGE: 10,
  
  COLORS: {
    BG: '#020818',
    CYAN: '#00f7ff',
    PURPLE: '#bf00ff',
    RED: '#ff3366',
    GOLD: '#ffd700',
    WHITE: '#ffffff'
  },
  
  UPGRADES: {
    fireRate: {
      levels: [100, 250, 500, 1000, 2000],
      effect: (level: number) => Math.max(50, 250 - level * 40) // ms
    },
    damage: {
      levels: [100, 250, 500, 1000, 2000],
      effect: (level: number) => 10 + level * 5
    },
    hp: {
      levels: [100, 250, 500, 1000, 2000],
      effect: (level: number) => 100 + level * 50
    },
    shield: {
      levels: [500, 1000, 2000],
      effect: (level: number) => level * 0.1 // % damage reduction
    },
    magnet: {
      levels: [250, 500, 1000],
      effect: (level: number) => 50 + level * 50 // radius px
    }
  },
  
  SHIPS: {
    viper: { name: 'Viper', cost: 0, costType: 'coins', hpMod: 1, speedMod: 1, desc: 'Balanced starter fighter.' },
    phantom: { name: 'Phantom', cost: 500, costType: 'gems', hpMod: 0.7, speedMod: 1.3, desc: 'Fast, fragile, deadly.' },
    titan: { name: 'Titan', cost: 1000, costType: 'gems', hpMod: 1.5, speedMod: 0.8, desc: 'Slow but heavily armored.' }
  }
};
