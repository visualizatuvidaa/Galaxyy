import { WORLDS, worldFromWave, waveWithinWorld } from './worlds';

export interface WaveConfig {
  number: number;
  enemyCount: number;
  types: string[];
  spawnInterval: number;
  baseHpMulti: number;
  isBoss: boolean;
  bossType?: string;
  worldNumber: number;
}

// Scaling constants per world
const HP_SCALE_PER_WORLD = 1.35;  // each world is 35% harder
const COUNT_SCALE_PER_WORLD = 1.2;

export const getWave = (waveNumber: number): WaveConfig => {
  const worldNum = worldFromWave(waveNumber);
  const waveInWorld = waveWithinWorld(waveNumber); // 1–5
  const isBoss = waveInWorld === 5;
  const world = WORLDS[Math.min(worldNum - 1, WORLDS.length - 1)];

  // Scaling grows each world
  const worldScale = Math.pow(HP_SCALE_PER_WORLD, worldNum - 1);
  const countScale = Math.pow(COUNT_SCALE_PER_WORLD, worldNum - 1);

  // Within a world, each wave gets slightly harder
  const waveScale = 1 + (waveInWorld - 1) * 0.2;

  if (isBoss) {
    return {
      number: waveNumber,
      enemyCount: 1,
      types: [],
      spawnInterval: 999,
      baseHpMulti: 50 * worldScale,
      isBoss: true,
      bossType: world.bossType,
      worldNumber: worldNum,
    };
  }

  const baseCount = Math.round((8 + waveInWorld * 4) * countScale);
  const baseInterval = Math.max(0.35, 1.4 - waveInWorld * 0.1 - worldNum * 0.04);

  return {
    number: waveNumber,
    enemyCount: baseCount,
    types: world.enemyPool,
    spawnInterval: baseInterval,
    baseHpMulti: waveScale * worldScale,
    isBoss: false,
    worldNumber: worldNum,
  };
};
