import { CONFIG } from './config';

export interface Point { x: number; y: number; }

export class Entity {
  id: string = Math.random().toString(36).substr(2, 9);
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  active: boolean = true;

  constructor(x: number, y: number, w: number, h: number, hp: number) {
    this.x = x; this.y = y; this.width = w; this.height = h;
    this.hp = hp; this.maxHp = hp;
  }

  takeDamage(amt: number) {
    this.hp -= amt;
    if (this.hp <= 0) this.active = false;
  }

  get bounds() {
    return { left: this.x - this.width / 2, right: this.x + this.width / 2, top: this.y - this.height / 2, bottom: this.y + this.height / 2 };
  }

  collidesWith(other: Entity) {
    const b1 = this.bounds, b2 = other.bounds;
    return !(b2.left > b1.right || b2.right < b1.left || b2.top > b1.bottom || b2.bottom < b1.top);
  }
}

export class Player extends Entity {
  lastFired: number = 0;
  fireRate: number;
  damage: number;
  shipType: string;
  shieldMod: number = 0;
  powerUps: Record<string, number> = {};
  invulnerableTime: number = 0;

  constructor(x: number, y: number, fireRate: number, damage: number, hp: number, shipType: string) {
    super(x, y, 30, 40, hp);
    this.fireRate = fireRate;
    this.damage = damage;
    this.shipType = shipType;
  }

  update(dt: number) {
    if (this.invulnerableTime > 0) this.invulnerableTime -= dt;
    for (const key in this.powerUps) {
      if (this.powerUps[key] > 0) {
        this.powerUps[key] -= dt;
        if (this.powerUps[key] <= 0) delete this.powerUps[key];
      }
    }
  }

  takeDamage(amt: number) {
    if (this.invulnerableTime > 0) return;
    const actual = amt * (1 - this.shieldMod);
    super.takeDamage(actual);
    this.invulnerableTime = 1.2;
  }
}

export class Bullet extends Entity {
  vy: number;
  vx?: number;
  damage: number;
  isEnemy: boolean;
  isMissile?: boolean;

  constructor(x: number, y: number, vy: number, damage: number, isEnemy = false, w = 4, h = 15) {
    super(x, y, w, h, 1);
    this.vy = vy;
    this.damage = damage;
    this.isEnemy = isEnemy;
  }

  update(dt: number) {
    this.y += this.vy * dt;
    if (this.vx) this.x += this.vx * dt;
    if (this.y < -100 || this.y > 1200 || this.x < -100 || this.x > 600) this.active = false;
  }
}

export class Enemy extends Entity {
  type: string;
  vy: number;
  vx: number;
  lastFired: number = 0;
  fireRate: number;
  spawnTime: number;
  timeAlive: number = 0;
  phase: number = 0;

  constructor(x: number, y: number, type: string, hp: number, vy: number, vx: number = 0, fireRate: number = 2000) {
    super(x, y, 30, 30, hp);
    this.type = type;
    this.vy = vy;
    this.vx = vx;
    this.fireRate = fireRate;
    this.spawnTime = performance.now();
    if (type === 'tank') { this.width = 50; this.height = 50; }
    else if (type === 'interceptor') { this.width = 20; this.height = 18; }
    else if (type === 'boss_mundo1') { this.width = 220; this.height = 120; }
    else if (type === 'boss_dreadnought') { this.width = 150; this.height = 80; }
    else if (type === 'boss_sentinel') { this.width = 100; this.height = 100; }
    else if (type === 'boss_nexus') { this.width = 200; this.height = 100; }
    else if (type === 'swarm') { this.width = 15; this.height = 15; }
  }

  update(dt: number, time: number) {
    this.timeAlive += dt;
    if (this.type === 'weaver') {
      this.x += Math.sin(this.timeAlive * 3) * 100 * dt;
      this.y += this.vy * dt;
    } else if (this.type === 'bomber') {
      this.y += this.vy * dt;
      this.x += this.vx * dt;
    } else if (this.type === 'interceptor') {
      this.y += this.vy * 1.8 * dt;
      this.x += Math.sin(this.timeAlive * 11) * 170 * dt;
      this.x += this.vx * dt;
    } else if (this.type === 'phantom') {
      this.x += Math.sin(this.timeAlive * 5) * 50 * dt;
      this.y += this.vy * dt;
    } else if (this.type === 'swarm') {
      this.y += this.vy * 1.5 * dt;
      this.x += Math.sin(this.timeAlive * 10) * 20 * dt;
    } else if (this.type === 'boss_mundo1') {
      if (this.y < 150) this.y += 40 * dt;
      else this.x += Math.sin(this.timeAlive * 1.2) * 90 * dt;
      this.y += Math.cos(this.timeAlive * 2) * 8 * dt;
      if (this.hp < this.maxHp * 0.5) this.phase = 1;
    } else if (this.type === 'boss_dreadnought') {
      if (this.y < 150) this.y += 50 * dt;
      else this.x += Math.sin(this.timeAlive) * 50 * dt;
      if (this.hp < this.maxHp * 0.5) this.phase = 1;
    } else if (this.type === 'boss_sentinel') {
      if (this.y < 200) this.y += 50 * dt;
      else { this.x = 200 + Math.cos(this.timeAlive) * 80; this.y = 200 + Math.sin(this.timeAlive) * 40; }
    } else {
      this.y += this.vy * dt;
      this.x += this.vx * dt;
    }
    if (this.y > 1100) this.active = false;
  }
}

export class Collectible extends Entity {
  type: 'coin' | 'gem' | 'shield' | 'rapidfire' | 'nuke' | 'multiplier';
  vy: number = 80;

  constructor(x: number, y: number, type: Collectible['type']) {
    super(x, y, 20, 20, 1);
    this.type = type;
  }

  update(dt: number) {
    this.y += this.vy * dt;
    if (this.y > 1100) this.active = false;
  }
}

export class Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number;
  color: string; size: number;
  active: boolean = true;

  constructor(x: number, y: number, vx: number, vy: number, life: number, color: string, size: number) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    this.life = life; this.maxLife = life;
    this.color = color; this.size = size;
  }

  update(dt: number) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 80 * dt;
    this.life -= dt;
    if (this.life <= 0) this.active = false;
  }
}
