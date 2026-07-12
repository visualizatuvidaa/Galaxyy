import { Entity, Player, Enemy, Bullet, Collectible, Particle } from './entities';
import { CONFIG } from './config';

export class Renderer {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  stars: {x: number, y: number, speed: number, size: number}[] = [];
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Could not get 2d context");
    this.ctx = ctx;
    
    // Init stars
    for (let i=0; i<200; i++) {
      this.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() * 2 + 0.5,
        size: Math.random() * 1.5 + 0.5
      });
    }
  }

  resize(w: number, h: number) {
    this.canvas.width = w;
    this.canvas.height = h;
  }

  clear() {
    this.ctx.fillStyle = CONFIG.COLORS.BG;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawBackground(dt: number) {
    this.ctx.fillStyle = '#ffffff';
    for (const star of this.stars) {
      star.y += star.speed * (dt * 60);
      if (star.y > this.canvas.height) {
        star.y = 0;
        star.x = Math.random() * this.canvas.width;
      }
      this.ctx.globalAlpha = star.size / 2;
      this.ctx.fillRect(star.x, star.y, star.size, star.size);
    }
    this.ctx.globalAlpha = 1.0;
  }

  drawPlayer(player: Player) {
    if (player.invulnerableTime > 0 && Math.floor(player.invulnerableTime * 10) % 2 === 0) return; // flicker
    
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(player.x, player.y);
    
    // Ship paths
    ctx.beginPath();
    ctx.moveTo(0, -player.height/2);
    ctx.lineTo(player.width/2, player.height/2);
    ctx.lineTo(0, player.height/2 - 10);
    ctx.lineTo(-player.width/2, player.height/2);
    ctx.closePath();
    
    ctx.fillStyle = CONFIG.COLORS.BG;
    ctx.fill();
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = CONFIG.COLORS.CYAN;
    ctx.shadowBlur = 15;
    ctx.shadowColor = CONFIG.COLORS.CYAN;
    ctx.stroke();

    if (player.powerUps.shield) {
      ctx.beginPath();
      ctx.arc(0, 0, player.width, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 150, 255, 0.5)';
      ctx.shadowColor = '#00f7ff';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    
    ctx.restore();
  }

  drawEnemy(enemy: Enemy) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    
    ctx.fillStyle = CONFIG.COLORS.BG;
    ctx.shadowBlur = 10;
    
    if (enemy.type === 'drifter') {
      ctx.strokeStyle = CONFIG.COLORS.RED;
      ctx.shadowColor = CONFIG.COLORS.RED;
      ctx.beginPath();
      ctx.moveTo(0, enemy.height/2);
      ctx.lineTo(enemy.width/2, -enemy.height/2);
      ctx.lineTo(-enemy.width/2, -enemy.height/2);
      ctx.closePath();
    } else if (enemy.type === 'weaver') {
      ctx.strokeStyle = '#ff00ff';
      ctx.shadowColor = '#ff00ff';
      ctx.beginPath();
      ctx.moveTo(0, enemy.height/2);
      ctx.lineTo(enemy.width/2, 0);
      ctx.lineTo(0, -enemy.height/2);
      ctx.lineTo(-enemy.width/2, 0);
      ctx.closePath();
    } else if (enemy.type === 'tank') {
      ctx.strokeStyle = '#ff8800';
      ctx.shadowColor = '#ff8800';
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 / 6) * i;
        const h = enemy.width/2;
        if (i===0) ctx.moveTo(Math.cos(a)*h, Math.sin(a)*h);
        else ctx.lineTo(Math.cos(a)*h, Math.sin(a)*h);
      }
      ctx.closePath();
    } else if (enemy.type === 'bomber') {
      ctx.strokeStyle = '#ff0000';
      ctx.shadowColor = '#ff0000';
      ctx.beginPath();
      ctx.arc(0, 0, enemy.width/2, 0, Math.PI*2);
    } else if (enemy.type.startsWith('boss')) {
      ctx.strokeStyle = enemy.phase === 0 ? CONFIG.COLORS.RED : CONFIG.COLORS.PURPLE;
      ctx.shadowColor = enemy.phase === 0 ? CONFIG.COLORS.RED : CONFIG.COLORS.PURPLE;
      ctx.lineWidth = 3;
      ctx.strokeRect(-enemy.width/2, -enemy.height/2, enemy.width, enemy.height);
      ctx.beginPath();
      ctx.moveTo(-enemy.width/2 + 20, enemy.height/2);
      ctx.lineTo(0, enemy.height/2 + 20);
      ctx.lineTo(enemy.width/2 - 20, enemy.height/2);
      ctx.stroke();
    } else if (enemy.type === 'phantom') {
      ctx.globalAlpha = 0.3 + (Math.sin(enemy.timeAlive * 5) + 1) / 2 * 0.5;
      ctx.strokeStyle = '#aaffff';
      ctx.shadowColor = '#aaffff';
      ctx.beginPath();
      ctx.moveTo(0, enemy.height/2);
      ctx.lineTo(enemy.width/2, 0);
      ctx.lineTo(0, -enemy.height/2);
      ctx.lineTo(-enemy.width/2, 0);
      ctx.closePath();
    } else {
      // Swarm / default
      ctx.strokeStyle = '#aaaaaa';
      ctx.shadowColor = '#aaaaaa';
      ctx.beginPath();
      ctx.moveTo(0, -enemy.height/2);
      ctx.lineTo(enemy.width/2, enemy.height/2);
      ctx.lineTo(-enemy.width/2, enemy.height/2);
      ctx.closePath();
    }
    
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    
    ctx.restore();
  }

  drawBullet(b: Bullet) {
    const ctx = this.ctx;
    ctx.save();
    ctx.shadowBlur = 10;
    
    if (b.isEnemy) {
      ctx.fillStyle = CONFIG.COLORS.RED;
      ctx.shadowColor = CONFIG.COLORS.RED;
    } else {
      ctx.fillStyle = CONFIG.COLORS.CYAN;
      ctx.shadowColor = CONFIG.COLORS.CYAN;
    }
    
    ctx.fillRect(b.x - b.width/2, b.y - b.height/2, b.width, b.height);
    ctx.restore();
  }

  drawCollectible(c: Collectible) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.shadowBlur = 15;
    
    if (c.type === 'coin') {
      ctx.fillStyle = CONFIG.COLORS.GOLD;
      ctx.shadowColor = CONFIG.COLORS.GOLD;
      ctx.beginPath();
      ctx.arc(0, 0, c.width/2, 0, Math.PI*2);
      ctx.fill();
    } else if (c.type === 'gem') {
      ctx.fillStyle = CONFIG.COLORS.CYAN;
      ctx.shadowColor = CONFIG.COLORS.CYAN;
      ctx.beginPath();
      ctx.moveTo(0, -c.height/2);
      ctx.lineTo(c.width/2, 0);
      ctx.lineTo(0, c.height/2);
      ctx.lineTo(-c.width/2, 0);
      ctx.fill();
    } else {
      ctx.fillStyle = '#00ff00';
      ctx.shadowColor = '#00ff00';
      ctx.beginPath();
      ctx.arc(0, 0, c.width/2, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawParticle(p: Particle) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 5;
    ctx.shadowColor = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}
