// ─── World / Scenario definitions ────────────────────────────────────────────
// 10 worlds × 5 waves each = 50 total waves
// Waves 1–4 of each world: normal combat
// Wave  5  of each world: Boss

export interface WorldDef {
  number: number;         // 1–10
  name: string;
  subtitle: string;
  lore: string;           // shown on world-clear screen
  // Background theme
  bgColor: string;        // deep background fill
  nebulaColor: string;    // nebula cloud tint
  starColor: string;      // star tint
  ambientGlow: string;    // canvas ambient
  // Boss
  bossType: string;
  bossName: string;
  // Enemy pool for prep waves
  enemyPool: string[];
}

export const WORLDS: WorldDef[] = [
  {
    number: 1,
    name: 'Nebulosa Roja',
    subtitle: 'El Primer Contacto',
    lore: 'Los exploradores confirmaron señales hostiles en la Nebulosa Roja. El Imperio Oscuro despierta.',
    bgColor: '#0d0008',
    nebulaColor: 'rgba(180,0,60,',
    starColor: '#ffcccc',
    ambientGlow: '#330011',
    bossType: 'boss_dreadnought',
    bossName: 'DREADNOUGHT',
    enemyPool: ['drifter', 'weaver'],
  },
  {
    number: 2,
    name: 'Campo de Asteroides',
    subtitle: 'Fuego Cruzado',
    lore: 'La flota enemiga se refugia entre los asteroides. Navega entre las rocas y destruye al guardián.',
    bgColor: '#080808',
    nebulaColor: 'rgba(100,80,40,',
    starColor: '#ddccaa',
    ambientGlow: '#1a1000',
    bossType: 'boss_sentinel',
    bossName: 'SENTINEL ACORAZADO',
    enemyPool: ['drifter', 'tank', 'swarm'],
  },
  {
    number: 3,
    name: 'Glaciar Cósmico',
    subtitle: 'El Frío del Vacío',
    lore: 'Temperaturas bajo cero. Los cristales de hielo reflejan los láseres. El Nexus bloquea el paso.',
    bgColor: '#00080d',
    nebulaColor: 'rgba(0,100,180,',
    starColor: '#aaeeff',
    ambientGlow: '#001122',
    bossType: 'boss_nexus',
    bossName: 'NEXUS GLACIAL',
    enemyPool: ['weaver', 'swarm', 'phantom'],
  },
  {
    number: 4,
    name: 'Zona de Tormenta',
    subtitle: 'La Gran Tempestad',
    lore: 'Tormentas electromagnéticas afectan los sistemas. Los bombarderos atacan desde la tormenta.',
    bgColor: '#060a00',
    nebulaColor: 'rgba(80,150,0,',
    starColor: '#ccffaa',
    ambientGlow: '#0a1500',
    bossType: 'boss_cyclone',
    bossName: 'CICLÓN ELÉCTRICO',
    enemyPool: ['bomber', 'weaver', 'drifter'],
  },
  {
    number: 5,
    name: 'Vacío Oscuro',
    subtitle: 'La Nada Absoluta',
    lore: 'Donde no hay luz ni sonido. Los fantasmas emergen de la oscuridad. El Señor Fantasma gobierna el vacío.',
    bgColor: '#000000',
    nebulaColor: 'rgba(60,0,100,',
    starColor: '#cc99ff',
    ambientGlow: '#050005',
    bossType: 'boss_phantom_lord',
    bossName: 'SEÑOR FANTASMA',
    enemyPool: ['phantom', 'swarm', 'bomber'],
  },
  {
    number: 6,
    name: 'Núcleo Ardiente',
    subtitle: 'El Corazón de Magma',
    lore: 'Un planeta moribundo. El magma sube y los tanques de fuego defienden el núcleo.',
    bgColor: '#0d0300',
    nebulaColor: 'rgba(200,80,0,',
    starColor: '#ffaa55',
    ambientGlow: '#1a0500',
    bossType: 'boss_inferno',
    bossName: 'INFERNO PRIME',
    enemyPool: ['tank', 'bomber', 'weaver'],
  },
  {
    number: 7,
    name: 'Flota Rebelde',
    subtitle: 'La Armada Maldita',
    lore: 'Cientos de naves rebeldes. La Armada Maldita tiene un solo objetivo: destruirte.',
    bgColor: '#000d08',
    nebulaColor: 'rgba(0,120,80,',
    starColor: '#aaffcc',
    ambientGlow: '#001408',
    bossType: 'boss_armada',
    bossName: 'ALMIRANTE ARMADA',
    enemyPool: ['drifter', 'weaver', 'tank', 'bomber'],
  },
  {
    number: 8,
    name: 'Dimensión Espejo',
    subtitle: 'Tu Propio Reflejo',
    lore: 'Una dimensión donde los enemigos copian tus movimientos. Solo el más rápido sobrevive.',
    bgColor: '#05000d',
    nebulaColor: 'rgba(120,0,200,',
    starColor: '#ffaaff',
    ambientGlow: '#0a0015',
    bossType: 'boss_mirror',
    bossName: 'DOPPELGANGER',
    enemyPool: ['phantom', 'weaver', 'tank', 'swarm'],
  },
  {
    number: 9,
    name: 'Corazón de la Galaxia',
    subtitle: 'El Centro de Todo',
    lore: 'El agujero negro galáctico. La gravedad dobla el espacio. El Galaxy Heart es el guardián final.',
    bgColor: '#080500',
    nebulaColor: 'rgba(200,160,0,',
    starColor: '#ffffaa',
    ambientGlow: '#100a00',
    bossType: 'boss_galaxy_heart',
    bossName: 'GALAXY HEART',
    enemyPool: ['bomber', 'phantom', 'tank', 'weaver', 'swarm'],
  },
  {
    number: 10,
    name: 'La Última Frontera',
    subtitle: 'El Fin del Imperio',
    lore: 'La batalla definitiva. OMEGA, el controlador supremo del Imperio Oscuro, despierta para destruirte.',
    bgColor: '#000000',
    nebulaColor: 'rgba(255,255,255,',
    starColor: '#ffffff',
    ambientGlow: '#050505',
    bossType: 'boss_omega',
    bossName: 'OMEGA SUPREMO',
    enemyPool: ['drifter', 'weaver', 'tank', 'bomber', 'phantom', 'swarm'],
  },
];

export const getWorld = (worldNumber: number): WorldDef =>
  WORLDS[Math.min(worldNumber - 1, WORLDS.length - 1)];

export const worldFromWave = (wave: number): number =>
  Math.ceil(wave / 5);

export const waveWithinWorld = (wave: number): number =>
  ((wave - 1) % 5) + 1; // 1–5 (5 = boss)
