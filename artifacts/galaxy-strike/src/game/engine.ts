import { Player, Enemy, Bullet, Collectible, Particle } from './entities';
import { getWave } from './waves';
import { Renderer } from './renderer';
import { InputHandler } from './input';
import { audio } from './audio';
import { loadSave, saveGame, updateStats, SaveData } from './storage';
import { CONFIG } from './config';

export class GameEngine {
  canvas: HTMLCanvasElement;
  renderer: Renderer;
  input: InputHandler;

  saveData: SaveData;

  player: Player;
  enemies: Enemy[] = [];
  bullets: Bullet[] = [];
  collectibles: Collectible[] = [];
  particles: Particle[] = [];

  lastTime: number = 0;
  animationFrameId: number = 0;
  isRunning: boolean = false;
  isPaused: boolean = false;

  wave: number = 1;
  enemiesToSpawn: number = 0;
  spawnTimer: number = 0;
  waveActive: boolean = false;
  waveClearDelay: number = 0;
  waveClearNotified: boolean = false;

  coinsCollected: number = 0;
  gemsCollected: number = 0;
  killCount: number = 0;
  wavesCleared: number = 0;
  score: number = 0;

  onGameOver: ((stats: any) => void) | null = null;
  onUpdateHUD: ((hud: any) => void) | null = null;
  onWaveClear: ((wave: number) => void) | null = null;
  onWaveStart: ((wave: number) => void) | null = null;

  shakeAmount: number = 0;
  weaponLevel: number = 0;
  dropChance: number = 0.3;
  playerSpeed: number = 420;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.input = new InputHandler();
    this.saveData = loadSave();

    // Apply upgrades
    this.weaponLevel = this.saveData.upgrades.weapon ?? 0;
    this.dropChance = CONFIG.UPGRADES.luck ? CONFIG.UPGRADES.luck.effect(this.saveData.upgrades.luck ?? 0) : 0.3;
    this.playerSpeed = CONFIG.UPGRADES.speed ? CONFIG.UPGRADES.speed.effect(this.saveData.upgrades.speed ?? 0) : 420;

    const s = CONFIG.SHIPS[this.saveData.selectedShip] ?? CONFIG.SHIPS['viper'];
    const maxHp = CONFIG.UPGRADES.hp.effect(this.saveData.upgrades.hp) * s.hpMod;
    const fireRate = CONFIG.UPGRADES.fireRate.effect(this.saveData.upgrades.fireRate);
    const damage = CONFIG.UPGRADES.damage.effect(this.saveData.upgrades.damage);

    this.player = new Player(
      canvas.width / 2,
      canvas.height - 120,
      fireRate,
      damage,
      maxHp,
      this.saveData.selectedShip
    );
    this.player.shieldMod = CONFIG.UPGRADES.shield.effect(this.saveData.upgrades.shield);

    // Pass skin to renderer
    this.renderer.setSkin(this.saveData.selectedSkin ?? 'default');

    this.input.onMoveCallback = (dx, dy) => {
      const speed = this.playerSpeed * s.speedMod;
      // Scale delta by speed modifier (dx/dy are already in pixels from drag)
      this.player.x = Math.max(this.player.width / 2, Math.min(this.canvas.width - this.player.width / 2, this.player.x + dx));
      this.player.y = Math.max(this.player.height / 2, Math.min(this.canvas.height - this.player.height / 2, this.player.y + dy));
    };

    this.wave = 1;
    this.startWave();
  }

  start() {
    this.input.attach();
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
    audio.init();
    // notify wave start
    if (this.onWaveStart) this.onWaveStart(1);
  }

  stop() {
    this.isRunning = false;
    this.input.detach();
    cancelAnimationFrame(this.animationFrameId);
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (!this.isPaused) {
      this.lastTime = performance.now();
      this.loop(this.lastTime);
    }
  }

  startWave() {
    const w = getWave(this.wave);
    this.enemiesToSpawn = w.enemyCount;
    this.spawnTimer = w.spawnInterval;
    this.waveActive = true;
    this.waveClearNotified = false;
  }

  spawnExplosion(x: number, y: number, isLarge: boolean) {
    const count = isLarge ? 50 : 15;
    const colors = ['#ff0000', '#ff8800', '#ffff00', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (isLarge ? 200 : 100);
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed, Math.sin(angle) * speed,
        Math.random() * 0.5 + 0.2,
        colors[Math.floor(Math.random() * colors.length)],
        Math.random() * 3 + 1
      ));
    }
    audio.playExplosion(isLarge);
  }

  private fireWeapon() {
    const now = performance.now();
    const cooldown = this.player.powerUps.rapidfire ? this.player.fireRate / 2 : this.player.fireRate;
    if (now - this.player.lastFired <= cooldown) return;
    this.player.lastFired = now;

    const dmg = this.player.damage;
    const lvl = this.weaponLevel;
    const px = this.player.x, py = this.player.y;

    // Always fire center laser
    this.bullets.push(new Bullet(px, py - 20, -820, dmg, false));

    if (lvl >= 1) {
      // Double — side by side
      this.bullets.push(new Bullet(px - 14, py - 14, -820, dmg * 0.8, false));
      this.bullets.push(new Bullet(px + 14, py - 14, -820, dmg * 0.8, false));
    }
    if (lvl >= 2) {
      // Triple spread — angled
      const spread = new Bullet(px - 20, py, -780, dmg * 0.7, false);
      spread.vx = -120;
      this.bullets.push(spread);
      const spread2 = new Bullet(px + 20, py, -780, dmg * 0.7, false);
      spread2.vx = 120;
      this.bullets.push(spread2);
    }
    if (lvl >= 3) {
      // Missile (every 3rd shot)
      if (Math.floor(now / 300) % 3 === 0) {
        const ml = new Bullet(px - 26, py, -400, dmg * 1.5, false, 8, 12);
        ml.isMissile = true;
        this.bullets.push(ml);
        const mr = new Bullet(px + 26, py, -400, dmg * 1.5, false, 8, 12);
        mr.isMissile = true;
        this.bullets.push(mr);
      }
    }
    if (lvl >= 4) {
      // Quad extra
      const q1 = new Bullet(px - 28, py - 10, -800, dmg * 0.6, false);
      q1.vx = -80;
      this.bullets.push(q1);
      const q2 = new Bullet(px + 28, py - 10, -800, dmg * 0.6, false);
      q2.vx = 80;
      this.bullets.push(q2);
    }

    // Titan triple
    if (this.player.shipType === 'titan' && lvl === 0) {
      this.bullets.push(new Bullet(px - 16, py - 14, -760, dmg * 0.75, false));
      this.bullets.push(new Bullet(px + 16, py - 14, -760, dmg * 0.75, false));
    }

    audio.playLaser();
  }

  update(dt: number) {
    if (this.shakeAmount > 0) this.shakeAmount -= dt * 20;

    this.player.update(dt);
    this.fireWeapon();

    // Spawning
    if (this.waveActive && this.enemiesToSpawn > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        const w = getWave(this.wave);
        const type = w.isBoss ? (w.bossType || 'boss_dreadnought') : w.types[Math.floor(Math.random() * w.types.length)];
        const hp = (type.startsWith('boss') ? 1000 : 30) * w.baseHpMulti;
        const x = type.startsWith('boss') ? this.canvas.width / 2 : Math.random() * (this.canvas.width - 60) + 30;
        this.enemies.push(new Enemy(x, -50, type, hp, 100 + this.wave * 5));
        this.enemiesToSpawn--;
        this.spawnTimer = w.spawnInterval;
      }
    }

    // Update entities
    this.enemies.forEach(e => {
      e.update(dt, performance.now() / 1000);
      if (performance.now() - e.lastFired > e.fireRate) {
        if (e.type === 'drifter' && Math.random() > 0.5) {
          this.bullets.push(new Bullet(e.x, e.y + e.height / 2, 300, 10, true));
          e.lastFired = performance.now();
        } else if (e.type === 'weaver' && Math.random() > 0.7) {
          this.bullets.push(new Bullet(e.x, e.y + e.height / 2, 320, 8, true));
          e.lastFired = performance.now();
        } else if (e.type === 'tank') {
          this.bullets.push(new Bullet(e.x - 10, e.y + e.height / 2, 250, 15, true, 6, 10));
          this.bullets.push(new Bullet(e.x + 10, e.y + e.height / 2, 250, 15, true, 6, 10));
          e.lastFired = performance.now();
        } else if (e.type.startsWith('boss')) {
          this.bullets.push(new Bullet(e.x - 20, e.y + e.height / 2, 400, 20, true));
          this.bullets.push(new Bullet(e.x + 20, e.y + e.height / 2, 400, 20, true));
          this.bullets.push(new Bullet(e.x, e.y + e.height / 2, 450, 20, true));
          e.lastFired = performance.now();
        }
      }
    });

    // Missile homing
    this.bullets.forEach(b => {
      if ((b as any).isMissile && !b.isEnemy && b.active) {
        // Find closest enemy
        let closest: Enemy | null = null;
        let closestDist = 99999;
        for (const e of this.enemies) {
          if (!e.active) continue;
          const d = Math.hypot(e.x - b.x, e.y - b.y);
          if (d < closestDist) { closestDist = d; closest = e; }
        }
        if (closest) {
          const dx = closest.x - b.x;
          const dy = closest.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0) {
            b.vx = (b.vx ?? 0) + (dx / dist) * 400 * dt;
            b.vy += (dy / dist) * 400 * dt;
            // cap
            const speed = Math.hypot(b.vx ?? 0, b.vy);
            const maxSpeed = 600;
            if (speed > maxSpeed) {
              const scale = maxSpeed / speed;
              if (b.vx !== undefined) b.vx *= scale;
              b.vy *= scale;
            }
          }
        }
      }
      b.update(dt);
    });

    this.collectibles.forEach(c => {
      c.update(dt);
      const magnetDist = CONFIG.UPGRADES.magnet.effect(this.saveData.upgrades.magnet);
      const dx = this.player.x - c.x;
      const dy = this.player.y - c.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < magnetDist) {
        c.x += (dx / dist) * 300 * dt;
        c.y += (dy / dist) * 300 * dt;
      }
    });
    this.particles.forEach(p => p.update(dt));

    // Bullet → Enemy collisions
    for (const b of this.bullets) {
      if (!b.active || b.isEnemy) continue;
      for (const e of this.enemies) {
        if (!e.active || !b.active) continue;
        if (b.collidesWith(e)) {
          b.active = false;
          e.takeDamage(b.damage);
          this.particles.push(new Particle(b.x, b.y, 0, 0, 0.1, '#ffffff', 2));
          if (!e.active) {
            this.killCount++;
            this.score += e.type.startsWith('boss') ? 1000 : 50;
            this.spawnExplosion(e.x, e.y, e.type.startsWith('boss'));
            const drop = this.dropChance;
            if (Math.random() < drop || e.type === 'tank' || e.type.startsWith('boss')) {
              this.collectibles.push(new Collectible(e.x, e.y, 'coin'));
              this.coinsCollected += 10;
            }
            if (Math.random() < 0.08) {
              const types: any[] = ['shield', 'rapidfire', 'gem', 'nuke'];
              this.collectibles.push(new Collectible(e.x, e.y, types[Math.floor(Math.random() * types.length)]));
            }
          }
          break;
        }
      }
    }

    // Enemy bullet → Player
    for (const b of this.bullets) {
      if (!b.active || !b.isEnemy) continue;
      if (b.collidesWith(this.player)) {
        b.active = false;
        this.player.takeDamage(b.damage);
        this.shakeAmount = 5;
        audio.playPlayerHit();
        if (this.player.hp <= 0) { this.gameOver(); return; }
      }
    }

    // Enemy → Player collision
    for (const e of this.enemies) {
      if (!e.active) continue;
      if (this.player.collidesWith(e)) {
        this.player.takeDamage(20);
        this.shakeAmount = 10;
        e.takeDamage(1000);
        if (!e.active) this.spawnExplosion(e.x, e.y, false);
        audio.playPlayerHit();
        if (this.player.hp <= 0) { this.gameOver(); return; }
      }
    }

    // Collectibles → Player
    for (const c of this.collectibles) {
      if (!c.active) continue;
      if (this.player.collidesWith(c)) {
        c.active = false;
        if (c.type === 'coin') {
          const amount = (this.player.powerUps.multiplier ? 2 : 1) * 10;
          this.coinsCollected += amount;
          this.score += 10;
          audio.playCoin();
        } else if (c.type === 'gem') {
          this.gemsCollected++;
          audio.playCoin();
        } else if (c.type === 'shield') {
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.maxHp * 0.25);
          audio.playPowerUp();
        } else if (c.type === 'rapidfire') {
          this.player.powerUps.rapidfire = 5.0;
          audio.playPowerUp();
        } else if (c.type === 'nuke') {
          this.enemies.forEach(en => en.takeDamage(9999));
          this.shakeAmount = 20;
          audio.playExplosion(true);
        }
      }
    }

    // Cleanup
    this.enemies = this.enemies.filter(e => e.active);
    this.bullets = this.bullets.filter(b => b.active);
    this.collectibles = this.collectibles.filter(c => c.active);
    this.particles = this.particles.filter(p => p.active);

    // Wave progression
    if (this.waveActive && this.enemiesToSpawn <= 0 && this.enemies.length === 0) {
      this.waveActive = false;
      this.waveClearDelay = 2.5;
      if (!this.waveClearNotified) {
        this.waveClearNotified = true;
        this.wavesCleared++;
        if (this.onWaveClear) this.onWaveClear(this.wave);
      }
    }

    if (!this.waveActive) {
      this.waveClearDelay -= dt;
      if (this.waveClearDelay <= 0) {
        this.wave++;
        this.startWave();
        if (this.onWaveStart) this.onWaveStart(this.wave);
      }
    }

    if (this.onUpdateHUD) {
      const boss = this.enemies.find(e => e.type.startsWith('boss'));
      this.onUpdateHUD({
        hp: this.player.hp,
        maxHp: this.player.maxHp,
        score: this.score,
        wave: this.wave,
        bossHp: boss ? boss.hp : 0,
        bossMaxHp: boss ? boss.maxHp : 0,
        waveClearDelay: this.waveClearDelay,
        waveActive: this.waveActive,
      });
    }
  }

  draw() {
    this.renderer.clear();
    this.renderer.drawBackground(0.016);

    this.renderer.ctx.save();
    if (this.shakeAmount > 0) {
      const dx = (Math.random() - 0.5) * this.shakeAmount;
      const dy = (Math.random() - 0.5) * this.shakeAmount;
      this.renderer.ctx.translate(dx, dy);
    }

    this.collectibles.forEach(c => this.renderer.drawCollectible(c));
    this.particles.forEach(p => this.renderer.drawParticle(p));
    this.bullets.forEach(b => this.renderer.drawBullet(b));
    this.enemies.forEach(e => this.renderer.drawEnemy(e));
    if (this.player.hp > 0) this.renderer.drawPlayer(this.player);

    this.renderer.ctx.restore();
  }

  loop = (time: number) => {
    if (!this.isRunning || this.isPaused) return;
    const dt = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;
    this.update(dt);
    this.draw();
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  gameOver() {
    this.stop();
    const save = this.saveData;
    const stats = {
      ...save.stats,
      totalKills: (save.stats.totalKills || 0) + this.killCount,
      totalGems: (save.stats.totalGems || 0) + this.gemsCollected,
      totalWaves: (save.stats.totalWaves || 0) + this.wavesCleared,
      totalCoins: (save.stats.totalCoins || 0) + this.coinsCollected,
      totalGamesPlayed: (save.stats.totalGamesPlayed || 0) + 1,
    };
    updateStats(stats);
    if (this.score > save.highScore) saveGame({ highScore: this.score });
    if (this.wave > save.highWave) saveGame({ highWave: this.wave });
    if (this.onGameOver) {
      this.onGameOver({
        score: this.score,
        wave: this.wave,
        coins: this.coinsCollected,
        gems: this.gemsCollected,
        kills: this.killCount,
      });
    }
  }
}
