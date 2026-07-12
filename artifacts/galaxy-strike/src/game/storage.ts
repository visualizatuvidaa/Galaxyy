export interface SaveData {
  coins: number;
  gems: number;
  highScore: number;
  highWave: number;
  selectedShip: 'viper' | 'phantom' | 'titan';
  unlockedShips: string[];
  upgrades: {
    fireRate: number;
    damage: number;
    hp: number;
    shield: number;
    magnet: number;
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
  };
}

const DEFAULT_SAVE: SaveData = {
  coins: 0,
  gems: 0,
  highScore: 0,
  highWave: 1,
  selectedShip: 'viper',
  unlockedShips: ['viper'],
  upgrades: {
    fireRate: 0,
    damage: 0,
    hp: 0,
    shield: 0,
    magnet: 0
  },
  achievements: {},
  missions: { date: '', items: [] },
  dailyReward: { lastClaimed: '', streak: 0 },
  stats: {
    totalKills: 0,
    totalGems: 0,
    totalPowerUps: 0,
    totalNukes: 0
  }
};

const SAVE_KEY = 'gsl_save';

export const loadSave = (): SaveData => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      return { ...DEFAULT_SAVE, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to load save', e);
  }
  return { ...DEFAULT_SAVE };
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
  saveGame({ coins: save.coins });
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
}

export const generateDailyMissions = () => {
  const save = loadSave();
  const today = new Date().toISOString().split('T')[0];
  
  if (save.missions.date !== today) {
    save.missions = {
      date: today,
      items: [
        { id: 'kills', desc: 'Destroy 50 enemies', target: 50, progress: 0, rewardType: 'coins', rewardAmount: 200, claimed: false },
        { id: 'waves', desc: 'Clear 3 waves', target: 3, progress: 0, rewardType: 'gems', rewardAmount: 2, claimed: false },
        { id: 'powerups', desc: 'Collect 5 power-ups', target: 5, progress: 0, rewardType: 'coins', rewardAmount: 150, claimed: false }
      ]
    };
    saveGame({ missions: save.missions });
  }
};
