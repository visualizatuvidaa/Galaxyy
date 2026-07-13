export interface SaveData {
  coins: number;
  gems: number;
  highScore: number;
  highWave: number;
  selectedShip: 'viper' | 'phantom' | 'titan';
  unlockedShips: string[];
  selectedSkin: string;
  unlockedSkins: string[];
  upgrades: {
    fireRate: number;
    damage: number;
    hp: number;
    shield: number;
    magnet: number;
    weapon: number;   // 0=básico 1=doble 2=triple 3=misil 4=quad
    speed: number;    // 0-3 velocidad de movimiento
    luck: number;     // 0-3 probabilidad de drops
  };
  achievements: Record<string, boolean>;
  missions: {
    date: string;
    items: { id: string; desc: string; target: number; progress: number; rewardType: 'coins'|'gems'; rewardAmount: number; claimed: boolean }[];
  };
  dailyReward: { lastClaimed: string; streak: number };
  stats: {
    totalKills: number;
    totalGems: number;
    totalPowerUps: number;
    totalNukes: number;
    totalWaves: number;
    totalCoins: number;
    totalGamesPlayed: number;
  };
  settings: {
    soundEnabled: boolean;
    vibrationEnabled: boolean;
  };
}

const DEFAULT_SAVE: SaveData = {
  coins: 0,
  gems: 0,
  highScore: 0,
  highWave: 1,
  selectedShip: 'viper',
  unlockedShips: ['viper'],
  selectedSkin: 'default',
  unlockedSkins: ['default'],
  upgrades: {
    fireRate: 0,
    damage: 0,
    hp: 0,
    shield: 0,
    magnet: 0,
    weapon: 0,
    speed: 0,
    luck: 0,
  },
  achievements: {},
  missions: { date: '', items: [] },
  dailyReward: { lastClaimed: '', streak: 0 },
  stats: {
    totalKills: 0,
    totalGems: 0,
    totalPowerUps: 0,
    totalNukes: 0,
    totalWaves: 0,
    totalCoins: 0,
    totalGamesPlayed: 0,
  },
  settings: {
    soundEnabled: true,
    vibrationEnabled: true,
  },
};

const SAVE_KEY = 'gsl_save_v2';

export const loadSave = (): SaveData => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Deep merge upgrades to handle new fields
      return {
        ...DEFAULT_SAVE,
        ...parsed,
        upgrades: { ...DEFAULT_SAVE.upgrades, ...(parsed.upgrades || {}) },
        stats: { ...DEFAULT_SAVE.stats, ...(parsed.stats || {}) },
        settings: { ...DEFAULT_SAVE.settings, ...(parsed.settings || {}) },
      };
    }
  } catch (e) {
    console.warn('Failed to load save', e);
  }
  return { ...DEFAULT_SAVE, upgrades: { ...DEFAULT_SAVE.upgrades }, stats: { ...DEFAULT_SAVE.stats }, settings: { ...DEFAULT_SAVE.settings } };
};

export const saveGame = (data: Partial<SaveData>) => {
  try {
    const current = loadSave();
    const merged = { ...current, ...data };
    localStorage.setItem(SAVE_KEY, JSON.stringify(merged));
  } catch (e) {
    console.warn('Failed to save game', e);
  }
};

export const addCoins = (amount: number) => {
  const save = loadSave();
  save.coins += amount;
  save.stats.totalCoins = (save.stats.totalCoins || 0) + amount;
  saveGame({ coins: save.coins, stats: save.stats });
};

export const addGems = (amount: number) => {
  const save = loadSave();
  save.gems += amount;
  save.stats.totalGems += amount;
  saveGame({ gems: save.gems, stats: save.stats });
};

export const updateStats = (updates: Partial<SaveData['stats']>) => {
  const save = loadSave();
  save.stats = { ...save.stats, ...updates };
  saveGame({ stats: save.stats });
};

export const generateDailyMissions = () => {
  const save = loadSave();
  const today = new Date().toISOString().split('T')[0];
  if (save.missions.date !== today) {
    save.missions = {
      date: today,
      items: [
        { id: 'kills', desc: 'Destruye 50 enemigos', target: 50, progress: 0, rewardType: 'coins', rewardAmount: 300, claimed: false },
        { id: 'waves', desc: 'Completa 3 oleadas', target: 3, progress: 0, rewardType: 'gems', rewardAmount: 3, claimed: false },
        { id: 'powerups', desc: 'Recoge 5 power-ups', target: 5, progress: 0, rewardType: 'coins', rewardAmount: 200, claimed: false },
        { id: 'score', desc: 'Consigue 5000 puntos', target: 5000, progress: 0, rewardType: 'coins', rewardAmount: 500, claimed: false },
      ],
    };
    saveGame({ missions: save.missions });
  }
};
