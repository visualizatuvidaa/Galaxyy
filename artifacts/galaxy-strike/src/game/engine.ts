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
  
  coinsCollected: number = 0;
  score: number = 0;
  
  onGameOver: ((stats: any) => void) | null = null;
  onUpdateHUD: ((hud: any) => void) | null = null;
  
  shakeAmount: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.input = new InputHandler();
    this.saveData = loadSave();
    
    // Init player based on save
    const s = CONFIG.SHIPS[this.saveData.selectedShip];
    const maxHp = CONFIG.UPGRADES.hp.effect(this.saveData.upgrades.hp) * s.hpMod;
    const fireRate = CONFIG.UPGRADES.fireRate.effect(this.saveData.upgrades.fireRate);
    const damage = CONFIG.UPGRADES.damage.effect(this.saveData.upgrades.damage);
    
    this.player = new Player(canvas.width / 2, canvas.height - 100, fireRate, damage, maxHp, this.saveData.selectedShip);
    this.player.shieldMod = CONFIG.UPGRADES.shield.effect(this.saveData.upgrades.shield);
    
    this.input.onMoveCallback = (dx, dy) => {
      this.player.x = Math.max(this.player.width/2, Math.min(this.canvas.width - this.player.width/2, this.player.x + dx));
      this.player.y = Math.max(this.player.height/2, Math.min(this.canvas.height - this.player.height/2, this.player.y + dy));
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
  }

  spawnExplosion(x: number, y: number, isLarge: boolean) {
    const count = isLarge ? 50 : 15;
    const colors = ['#ff0000', '#ff8800', '#ffff00', '#ffffff'];
    for(let i=0; i<count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (isLarge ? 200 : 100);
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle)*speed, Math.sin(angle)*speed,
        Math.random() * 0.5 + 0.2,
        colors[Math.floor(Math.random()*colors.length)],
        Math.random() * 3 + 1
      ));
    }
    audio.playExplosion(isLarge);
  }

  update(dt: number) {
    if (this.shakeAmount > 0) this.shakeAmount -= dt * 20;
    
    this.player.update(dt);
    
    // Player shooting
    if (performance.now() - this.player.lastFired > (this.player.powerUps.rapidfire ? this.player.fireRate / 2 : this.player.fireRate)) {
      this.bullets.push(new Bullet(this.player.x, this.player.y - 20, -800, this.player.damage, false));
      // spread shot for titan
      if (this.player.shipType === 'titan') {
         const b1 = new Bullet(this.player.x - 15, this.player.y - 20, -750, this.player.damage, false);
         b1.x -= 20; // hacky spread
         const b2 = new Bullet(this.player.x + 15, this.player.y - 20, -750, this.player.damage, false);
         b2.x += 20;
         this.bullets.push(b1, b2);
      }
      this.player.lastFired = performance.now();
      audio.playLaser();
    }

    // Spawning
    if (this.waveActive && this.enemiesToSpawn > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        const w = getWave(this.wave);
        const type = w.isBoss ? (w.bossType || 'boss_dreadnought') : w.types[Math.floor(Math.random() * w.types.length)];
        const hp = (type.startsWith('boss') ? 1000 : 30) * w.baseHpMulti;
        const x = type.startsWith('boss') ? this.canvas.width/2 : Math.random() * (this.canvas.width - 60) + 30;
        
        this.enemies.push(new Enemy(x, -50, type, hp, 100 + this.wave * 5));
        this.enemiesToSpawn--;
        this.spawnTimer = w.spawnInterval;
      }
    }

    // Update Entities
    this.enemies.forEach(e => {
      e.update(dt, performance.now() / 1000);
      
      // Enemy shooting
      if (performance.now() - e.lastFired > e.fireRate) {
        if (e.type === 'drifter' && Math.random() > 0.5) {
          this.bullets.push(new Bullet(e.x, e.y + e.height/2, 300, 10, true));
          e.lastFired = performance.now();
        } else if (e.type.startsWith('boss')) {
          this.bullets.push(new Bullet(e.x - 20, e.y + e.height/2, 400, 20, true));
          this.bullets.push(new Bullet(e.x + 20, e.y + e.height/2, 400, 20, true));
          this.bullets.push(new Bullet(e.x, e.y + e.height/2, 450, 20, true));
          e.lastFired = performance.now();
        }
      }
    });
    
    this.bullets.forEach(b => b.update(dt));
    this.collectibles.forEach(c => {
      c.update(dt);
      
      // Magnet
      const magnetDist = CONFIG.UPGRADES.magnet.effect(this.saveData.upgrades.magnet);
      const dx = this.player.x - c.x;
      const dy = this.player.y - c.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < magnetDist) {
        c.x += (dx/dist) * 300 * dt;
        c.y += (dy/dist) * 300 * dt;
      }
    });
    this.particles.forEach(p => p.update(dt));

    // Collisions
    for (const b of this.bullets) {
      if (!b.active) continue;
      
      if (b.isEnemy) {
        if (b.collidesWith(this.player)) {
          b.active = false;
          this.player.takeDamage(b.damage);
          this.shakeAmount = 5;
          audio.playPlayerHit();
          if (this.player.hp <= 0) this.gameOver();
        }
      } else {
        for (const e of this.enemies) {
          if (!e.active || !b.active) continue;
          if (b.collidesWith(e)) {
            b.active = false;
            e.takeDamage(b.damage);
            
            // Hit particle
            this.particles.push(new Particle(b.x, b.y, 0, 0, 0.1, '#ffffff', 2));
            
            if (!e.active) {
              this.score += e.type.startsWith('boss') ? 1000 : 50;
              this.spawnExplosion(e.x, e.y, e.type.startsWith('boss'));
              
              // Drops
              if (Math.random() < 0.3 || e.type === 'tank' || e.type.startsWith('boss')) {
                this.collectibles.push(new Collectible(e.x, e.y, 'coin'));
              }
              if (Math.random() < 0.05) {
                const types: any[] = ['shield', 'rapidfire', 'gem', 'nuke'];
                this.collectibles.push(new Collectible(e.x, e.y, types[Math.floor(Math.random()*types.length)]));
              }
            }
            break;
          }
        }
      }
    }
    
    // Player-Enemy collision
    for (const e of this.enemies) {
      if (!e.active) continue;
      if (this.player.collidesWith(e)) {
        this.player.takeDamage(20);
        this.shakeAmount = 10;
        e.takeDamage(1000); // destroy small enemies on crash
        if (e.active === false) this.spawnExplosion(e.x, e.y, false);
        audio.playPlayerHit();
        if (this.player.hp <= 0) this.gameOver();
      }
    }
    
    // Collectibles collision
    for (const c of this.collectibles) {
      if (!c.active) continue;
      if (this.player.collidesWith(c)) {
        c.active = false;
        if (c.type === 'coin') {
          this.coinsCollected += (this.player.powerUps.multiplier ? 2 : 1) * 10;
          this.score += 10;
          audio.playCoin();
        } else if (c.type === 'gem') {
          // just track in local session, apply at game over
          audio.playCoin();
        } else if (c.type === 'shield') {
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.maxHp * 0.25);
          audio.playPowerUp();
        } else if (c.type === 'rapidfire') {
          this.player.powerUps.rapidfire = 5.0; // 5 seconds
          audio.playPowerUp();
        } else if (c.type === 'nuke') {
          this.enemies.forEach(en => en.takeDamage(9999));
          this.shakeAmount = 20;
          this.renderer.ctx.fillStyle = 'rgba(255,255,255,0.5)';
          this.renderer.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
          audio.playExplosion(true);
        }
      }
    }

    // Cleanup
    this.enemies = this.enemies.filter(e => e.active);
    this.bullets = this.bullets.filter(b => b.active);
    this.collectibles = this.collectibles.filter(c => c.active);
    this.particles = this.particles.filter(p => p.active);

    // Wave Progression
    if (this.waveActive && this.enemiesToSpawn <= 0 && this.enemies.length === 0) {
      this.waveActive = false;
      this.waveClearDelay = 2.0;
    }
    
    if (!this.waveActive) {
      this.waveClearDelay -= dt;
      if (this.waveClearDelay <= 0) {
        this.wave++;
        this.startWave();
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
        bossMaxHp: boss ? boss.maxHp : 0
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
    
    const dt = Math.min((time - this.lastTime) / 1000, 0.1); // cap dt
    this.lastTime = time;
    
    this.update(dt);
    this.draw();
    
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  gameOver() {
    this.stop();
    updateStats({ totalKills: this.score / 50 }); // rough estimate
    if (this.score > this.saveData.highScore) saveGame({ highScore: this.score });
    if (this.wave > this.saveData.highWave) saveGame({ highWave: this.wave });
    
    if (this.onGameOver) {
      this.onGameOver({
        score: this.score,
        wave: this.wave,
        coins: this.coinsCollected
      });
    }
  }
}
