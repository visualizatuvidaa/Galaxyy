export interface WaveConfig {
  number: number;
  enemyCount: number;
  types: string[];
  spawnInterval: number;
  baseHpMulti: number;
  isBoss: boolean;
  bossType?: string;
}

export const WAVES: WaveConfig[] = [
  { number: 1, enemyCount: 10, types: ['drifter'], spawnInterval: 1.5, baseHpMulti: 1, isBoss: false },
  { number: 2, enemyCount: 15, types: ['drifter', 'weaver'], spawnInterval: 1.2, baseHpMulti: 1.2, isBoss: false },
  { number: 3, enemyCount: 20, types: ['drifter', 'weaver', 'tank'], spawnInterval: 1.0, baseHpMulti: 1.5, isBoss: false },
  { number: 4, enemyCount: 30, types: ['weaver', 'tank', 'swarm'], spawnInterval: 0.8, baseHpMulti: 1.8, isBoss: false },
  { number: 5, enemyCount: 1, types: [], spawnInterval: 999, baseHpMulti: 50, isBoss: true, bossType: 'boss_dreadnought' },
  
  { number: 6, enemyCount: 25, types: ['bomber', 'weaver'], spawnInterval: 1.0, baseHpMulti: 2.2, isBoss: false },
  { number: 7, enemyCount: 35, types: ['phantom', 'drifter'], spawnInterval: 0.8, baseHpMulti: 2.5, isBoss: false },
  { number: 8, enemyCount: 40, types: ['tank', 'bomber', 'swarm'], spawnInterval: 0.7, baseHpMulti: 3.0, isBoss: false },
  { number: 9, enemyCount: 50, types: ['phantom', 'bomber', 'weaver', 'tank'], spawnInterval: 0.6, baseHpMulti: 3.5, isBoss: false },
  { number: 10, enemyCount: 1, types: [], spawnInterval: 999, baseHpMulti: 100, isBoss: true, bossType: 'boss_sentinel' },
];

export const getWave = (waveNumber: number): WaveConfig => {
  if (waveNumber <= 10) {
    return WAVES[waveNumber - 1];
  }
  // Procedural scaling after wave 10
  const isBoss = waveNumber % 5 === 0;
  let bossType = undefined;
  if (isBoss) {
    const r = waveNumber % 15;
    if (r === 5) bossType = 'boss_dreadnought';
    else if (r === 10) bossType = 'boss_sentinel';
    else bossType = 'boss_nexus';
  }
  
  return {
    number: waveNumber,
    enemyCount: isBoss ? 1 : 40 + waveNumber * 2,
    types: ['drifter', 'weaver', 'tank', 'bomber', 'phantom', 'swarm'],
    spawnInterval: Math.max(0.3, 1.0 - (waveNumber * 0.02)),
    baseHpMulti: Math.pow(1.15, waveNumber - 10) * 3.5,
    isBoss,
    bossType
  };
};
