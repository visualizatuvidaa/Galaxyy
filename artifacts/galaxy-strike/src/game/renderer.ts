import { Entity, Player, Enemy, Bullet, Collectible, Particle } from './entities';
import { CONFIG } from './config';

interface SkinColors {
  bodyColor: string;
  cockpitColor: string;
  wingColor: string;
  glowColor: string;
}

export class Renderer {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  stars: { x: number; y: number; speed: number; size: number; twinkle: number }[] = [];
  time: number = 0;
  skin: SkinColors = CONFIG.SKINS['default'];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');
    this.ctx = ctx;
    for (let i = 0; i < 200; i++) {
      this.stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, speed: Math.random() * 2 + 0.5, size: Math.random() * 2 + 0.5, twinkle: Math.random() * Math.PI * 2 });
    }
  }

  setSkin(skinId: string) {
    this.skin = CONFIG.SKINS[skinId] ?? CONFIG.SKINS['default'];
  }

  resize(w: number, h: number) { this.canvas.width = w; this.canvas.height = h; }

  clear() { this.ctx.fillStyle = CONFIG.COLORS.BG; this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); }

  drawBackground(dt: number) {
    this.time += dt;
    const ctx = this.ctx;
    for (const star of this.stars) {
      star.y += star.speed * (dt * 60);
      star.twinkle += dt * 3;
      if (star.y > this.canvas.height) { star.y = 0; star.x = Math.random() * this.canvas.width; }
      const alpha = Math.max(0.1, 0.4 + Math.sin(star.twinkle) * 0.3);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = star.size > 2 ? '#aaddff' : '#ffffff';
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }
    ctx.globalAlpha = 1.0;
  }

  private _outline(ctx: CanvasRenderingContext2D, color = '#000', width = 3) {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
  }
  private _glow(ctx: CanvasRenderingContext2D, color: string, blur = 18) {
    ctx.shadowBlur = blur; ctx.shadowColor = color;
  }
  private _clearGlow(ctx: CanvasRenderingContext2D) {
    ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
  }

  // ─── Player ─────────────────────────────────────────────────────────────────
  drawPlayer(player: Player) {
    if (player.invulnerableTime > 0 && Math.floor(player.invulnerableTime * 10) % 2 === 0) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(player.x, player.y);
    const w = player.width, h = player.height;
    const sk = this.skin;

    // Engine flame
    const ff = 0.8 + Math.sin(this.time * 18) * 0.2;
    const flameGrad = ctx.createRadialGradient(0, h * 0.35, 0, 0, h * 0.35, w * 0.55 * ff);
    flameGrad.addColorStop(0, 'rgba(255,220,80,1)');
    flameGrad.addColorStop(0.4, 'rgba(255,100,0,0.85)');
    flameGrad.addColorStop(1, 'rgba(200,0,80,0)');
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.ellipse(0, h * 0.42, w * 0.28 * ff, h * 0.22 * ff, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    for (const sign of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(sign * w * 0.28, -h * 0.05);
      ctx.lineTo(sign * w * 0.95, h * 0.38);
      ctx.lineTo(sign * w * 0.28, h * 0.28);
      ctx.closePath();
      ctx.fillStyle = sk.wingColor;
      ctx.fill();
      this._outline(ctx, '#000', 2.5);
      ctx.beginPath();
      ctx.moveTo(sign * w * 0.32, h * 0.05);
      ctx.lineTo(sign * w * 0.78, h * 0.33);
      ctx.lineWidth = 2; ctx.strokeStyle = sk.bodyColor; ctx.stroke();
    }

    // Body
    this._glow(ctx, sk.glowColor, 10);
    ctx.beginPath();
    ctx.ellipse(0, h * 0.05, w * 0.34, h * 0.44, 0, 0, Math.PI * 2);
    ctx.fillStyle = sk.bodyColor; ctx.fill();
    this._outline(ctx, '#000', 3);
    this._clearGlow(ctx);

    // Body highlight
    ctx.beginPath();
    ctx.ellipse(-w * 0.08, -h * 0.08, w * 0.1, h * 0.22, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fill();

    // Cockpit
    this._glow(ctx, sk.cockpitColor, 12);
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.18, w * 0.19, h * 0.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = sk.cockpitColor; ctx.fill();
    this._outline(ctx, '#000', 2.5);
    this._clearGlow(ctx);

    // Cockpit glint
    ctx.beginPath();
    ctx.ellipse(-w * 0.06, -h * 0.24, w * 0.06, h * 0.05, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fill();

    // Nose tip
    ctx.beginPath(); ctx.arc(0, -h * 0.44, w * 0.07, 0, Math.PI * 2);
    ctx.fillStyle = sk.cockpitColor; ctx.fill();
    this._outline(ctx, '#000', 2);

    // Engine nozzle
    ctx.beginPath(); ctx.ellipse(0, h * 0.38, w * 0.16, h * 0.07, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#333355'; ctx.fill(); this._outline(ctx, '#000', 2);

    // Outer neon glow
    this._glow(ctx, sk.glowColor, 20);
    ctx.strokeStyle = sk.glowColor + '88'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, h * 0.05, w * 0.34, h * 0.44, 0, 0, Math.PI * 2); ctx.stroke();
    this._clearGlow(ctx);

    // Shield
    if (player.powerUps.shield) {
      this._glow(ctx, '#00f7ff', 25);
      ctx.beginPath(); ctx.arc(0, 0, w * 1.1, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,200,255,0.6)'; ctx.lineWidth = 3; ctx.stroke();
      this._clearGlow(ctx);
    }
    ctx.restore();
  }

  // ─── Enemies ─────────────────────────────────────────────────────────────────
  drawEnemy(enemy: Enemy) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    switch (enemy.type) {
      case 'drifter':  this._drawDrifter(ctx, enemy); break;
      case 'weaver':   this._drawWeaver(ctx, enemy);  break;
      case 'tank':     this._drawTank(ctx, enemy);    break;
      case 'bomber':   this._drawBomber(ctx, enemy);  break;
      case 'swarm':    this._drawSwarm(ctx, enemy);   break;
      case 'phantom':  this._drawPhantom(ctx, enemy); break;
      default: if (enemy.type.startsWith('boss')) this._drawBoss(ctx, enemy); else this._drawDrifter(ctx, enemy);
    }
    ctx.restore();
  }

  private _drawDrifter(ctx: CanvasRenderingContext2D, e: Enemy) {
    const w = e.width, h = e.height;
    this._glow(ctx, '#ff3344', 12);
    ctx.beginPath(); ctx.ellipse(0, h * 0.1, w * 0.5, h * 0.28, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#cc1122'; ctx.fill(); this._outline(ctx, '#000', 2.5);
    ctx.beginPath(); ctx.ellipse(0, -h * 0.05, w * 0.28, h * 0.22, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6655'; ctx.fill(); this._outline(ctx, '#000', 2);
    ctx.beginPath(); ctx.ellipse(-w * 0.06, -h * 0.1, w * 0.09, h * 0.07, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,200,200,0.5)'; ctx.fill();
    for (const ex of [-w * 0.14, w * 0.14]) {
      ctx.beginPath(); ctx.arc(ex, h * 0.08, 4.5, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.beginPath(); ctx.arc(ex + 1, h * 0.09, 2.5, 0, Math.PI * 2); ctx.fillStyle = '#000'; ctx.fill();
    }
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(i * w * 0.18, h * 0.26, 3, 0, Math.PI * 2); ctx.fillStyle = i === 0 ? '#ffdd00' : '#ff8800'; ctx.fill(); }
    this._clearGlow(ctx);
  }

  private _drawWeaver(ctx: CanvasRenderingContext2D, e: Enemy) {
    const w = e.width, h = e.height;
    this._glow(ctx, '#ff00ff', 14);
    for (const sign of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(0, -h * 0.1);
      ctx.bezierCurveTo(sign * w * 0.6, -h * 0.4, sign * w * 0.8, h * 0.1, sign * w * 0.4, h * 0.35);
      ctx.bezierCurveTo(sign * w * 0.2, h * 0.45, 0, h * 0.3, 0, h * 0.1);
      ctx.closePath(); ctx.fillStyle = '#880088'; ctx.fill(); this._outline(ctx, '#000', 2);
    }
    ctx.beginPath(); ctx.ellipse(0, h * 0.05, w * 0.22, h * 0.38, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#dd00dd'; ctx.fill(); this._outline(ctx, '#000', 2.5);
    ctx.beginPath(); ctx.arc(0, -h * 0.05, 6, 0, Math.PI * 2); ctx.fillStyle = '#ffff00'; ctx.fill();
    ctx.beginPath(); ctx.arc(1, -h * 0.05 + 1, 3, 0, Math.PI * 2); ctx.fillStyle = '#000'; ctx.fill();
    this._clearGlow(ctx);
  }

  private _drawTank(ctx: CanvasRenderingContext2D, e: Enemy) {
    const w = e.width, h = e.height;
    this._glow(ctx, '#ff8800', 14);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) { const a = (Math.PI * 2 / 6) * i - Math.PI / 6, r = w * 0.48; if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath(); ctx.fillStyle = '#cc5500'; ctx.fill(); this._outline(ctx, '#000', 3);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) { const a = (Math.PI * 2 / 6) * i - Math.PI / 6, r = w * 0.3; if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath(); ctx.fillStyle = '#ff7722'; ctx.fill();
    for (let i = 0; i < 6; i++) { const a = (Math.PI * 2 / 6) * i - Math.PI / 6, r = w * 0.38; ctx.beginPath(); ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 3, 0, Math.PI * 2); ctx.fillStyle = '#ffcc00'; ctx.fill(); }
    for (const ex of [-w * 0.14, w * 0.14]) {
      ctx.beginPath(); ctx.arc(ex, -h * 0.06, 5, 0, Math.PI * 2); ctx.fillStyle = '#ff0000'; ctx.fill();
      ctx.beginPath(); ctx.arc(ex + 1, -h * 0.06 + 1, 2.5, 0, Math.PI * 2); ctx.fillStyle = '#000'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(ex - 5, -h * 0.14); ctx.lineTo(ex + (ex < 0 ? 5 : -5), -h * 0.1); ctx.lineWidth = 2; ctx.strokeStyle = '#000'; ctx.stroke();
    }
    this._clearGlow(ctx);
  }

  private _drawBomber(ctx: CanvasRenderingContext2D, e: Enemy) {
    const w = e.width, h = e.height;
    this._glow(ctx, '#ff0033', 16);
    ctx.beginPath(); ctx.arc(0, 0, w * 0.46, 0, Math.PI * 2); ctx.fillStyle = '#220022'; ctx.fill(); this._outline(ctx, '#000', 3);
    for (let i = 0; i < 8; i++) { const a = (Math.PI * 2 / 8) * i, r1 = w * 0.42, r2 = w * 0.62; ctx.beginPath(); ctx.moveTo(Math.cos(a - 0.2) * r1, Math.sin(a - 0.2) * r1); ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2); ctx.lineTo(Math.cos(a + 0.2) * r1, Math.sin(a + 0.2) * r1); ctx.closePath(); ctx.fillStyle = '#dd0022'; ctx.fill(); this._outline(ctx, '#000', 1.5); }
    ctx.beginPath(); ctx.arc(0, -h * 0.04, w * 0.26, 0, Math.PI * 2); ctx.fillStyle = '#eeddcc'; ctx.fill(); this._outline(ctx, '#000', 2);
    for (const ex of [-w * 0.1, w * 0.1]) { ctx.beginPath(); ctx.arc(ex, -h * 0.1, 5, 0, Math.PI * 2); ctx.fillStyle = '#000'; ctx.fill(); }
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.rect(i * w * 0.1 - 3, h * 0.06, 6, 6); ctx.fillStyle = '#000'; ctx.fill(); }
    this._clearGlow(ctx);
  }

  private _drawSwarm(ctx: CanvasRenderingContext2D, e: Enemy) {
    const w = e.width, h = e.height;
    this._glow(ctx, '#aa00ff', 12);
    ctx.beginPath(); ctx.moveTo(0, -h * 0.5); ctx.lineTo(w * 0.5, 0); ctx.lineTo(0, h * 0.5); ctx.lineTo(-w * 0.5, 0); ctx.closePath();
    ctx.fillStyle = '#8800cc'; ctx.fill(); this._outline(ctx, '#000', 2);
    ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fillStyle = '#ff0'; ctx.fill();
    ctx.beginPath(); ctx.arc(1, 1, 2, 0, Math.PI * 2); ctx.fillStyle = '#000'; ctx.fill();
    this._clearGlow(ctx);
  }

  private _drawPhantom(ctx: CanvasRenderingContext2D, e: Enemy) {
    const w = e.width, h = e.height;
    ctx.globalAlpha = 0.35 + (Math.sin(e.timeAlive * 5) + 1) / 2 * 0.5;
    this._glow(ctx, '#aaffff', 20);
    ctx.beginPath(); ctx.moveTo(-w * 0.44, h * 0.1); ctx.bezierCurveTo(-w * 0.44, -h * 0.45, w * 0.44, -h * 0.45, w * 0.44, h * 0.1); ctx.lineTo(w * 0.44, h * 0.35); ctx.bezierCurveTo(w * 0.3, h * 0.22, w * 0.15, h * 0.48, 0, h * 0.35); ctx.bezierCurveTo(-w * 0.15, h * 0.22, -w * 0.3, h * 0.48, -w * 0.44, h * 0.35); ctx.closePath();
    ctx.fillStyle = '#aaddff'; ctx.fill(); this._outline(ctx, '#003355', 2);
    for (const ex of [-w * 0.15, w * 0.15]) { ctx.beginPath(); ctx.arc(ex, -h * 0.1, 5, 0, Math.PI * 2); ctx.fillStyle = '#001133'; ctx.fill(); }
    this._clearGlow(ctx); ctx.globalAlpha = 1;
  }

  private _drawBoss(ctx: CanvasRenderingContext2D, e: Enemy) {
    const w = e.width, h = e.height;
    const isP2 = e.phase === 1;
    const color = isP2 ? CONFIG.COLORS.PURPLE : CONFIG.COLORS.RED;
    this._glow(ctx, color, 20);
    ctx.beginPath(); ctx.roundRect(-w * 0.48, -h * 0.45, w * 0.96, h * 0.9, 12); ctx.fillStyle = isP2 ? '#330044' : '#220011'; ctx.fill(); this._outline(ctx, '#000', 4);
    ctx.beginPath(); ctx.roundRect(-w * 0.35, -h * 0.32, w * 0.7, h * 0.64, 8); ctx.fillStyle = isP2 ? '#660088' : '#660022'; ctx.fill(); this._outline(ctx, '#000', 2);
    ctx.beginPath(); ctx.roundRect(-8, h * 0.35, 16, h * 0.18, 4); ctx.fillStyle = '#333'; ctx.fill(); this._outline(ctx, '#000', 2);
    for (const sx of [-w * 0.32, w * 0.32]) { ctx.beginPath(); ctx.roundRect(sx - 6, h * 0.28, 12, h * 0.22, 3); ctx.fillStyle = '#444'; ctx.fill(); this._outline(ctx, '#000', 2); }
    for (let i = 0; i < 3; i++) {
      const ex = (i - 1) * w * 0.22;
      ctx.beginPath(); ctx.arc(ex, -h * 0.08, 10, 0, Math.PI * 2); ctx.fillStyle = isP2 ? '#dd00ff' : '#ff0033'; ctx.fill(); this._outline(ctx, '#000', 2);
      this._glow(ctx, color, 15); ctx.beginPath(); ctx.arc(ex, -h * 0.08, 5, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); this._clearGlow(ctx);
    }
    const hpPct = Math.max(0, e.hp / e.maxHp), barW = w * 0.8;
    ctx.fillStyle = '#333'; ctx.fillRect(-barW / 2, -h * 0.5 - 12, barW, 7);
    ctx.fillStyle = isP2 ? '#dd00ff' : '#ff0033'; ctx.fillRect(-barW / 2, -h * 0.5 - 12, barW * hpPct, 7); this._outline(ctx, '#000', 1.5);
    this._clearGlow(ctx);
  }

  // ─── Bullets ─────────────────────────────────────────────────────────────────
  drawBullet(b: Bullet) {
    const ctx = this.ctx;
    ctx.save();
    if ((b as any).isMissile) {
      this._glow(ctx, '#ff8800', 12);
      ctx.fillStyle = '#ff6600';
      ctx.beginPath(); ctx.ellipse(b.x, b.y, 5, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(b.x, b.y - 8, 3, 0, Math.PI * 2); ctx.fillStyle = '#ffff00'; ctx.fill();
    } else if (b.isEnemy) {
      ctx.shadowBlur = 12; ctx.shadowColor = CONFIG.COLORS.RED;
      ctx.fillStyle = '#ff3366';
      ctx.beginPath(); ctx.ellipse(b.x, b.y, b.width * 0.8, b.height * 0.4, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.shadowBlur = 12; ctx.shadowColor = this.skin.glowColor;
      const grad = ctx.createLinearGradient(b.x, b.y - b.height / 2, b.x, b.y + b.height / 2);
      grad.addColorStop(0, 'rgba(0,247,255,0)'); grad.addColorStop(0.3, this.skin.glowColor); grad.addColorStop(0.7, '#ffffff'); grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.ellipse(b.x, b.y, b.width * 0.7, b.height * 0.45, 0, 0, Math.PI * 2); ctx.fill();
    }
    this._clearGlow(ctx);
    ctx.restore();
  }

  // ─── Collectibles ─────────────────────────────────────────────────────────────
  drawCollectible(c: Collectible) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(c.x, c.y + Math.sin(this.time * 4 + c.x) * 2);
    if (c.type === 'coin') {
      this._glow(ctx, CONFIG.COLORS.GOLD, 15); ctx.beginPath(); ctx.arc(0, 0, c.width / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700'; ctx.fill(); this._outline(ctx, '#cc8800', 2);
      ctx.fillStyle = '#cc8800'; ctx.font = `bold ${c.width * 0.6}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 1);
    } else if (c.type === 'gem') {
      this._glow(ctx, CONFIG.COLORS.CYAN, 15); ctx.beginPath(); ctx.moveTo(0, -c.height / 2); ctx.lineTo(c.width / 2, 0); ctx.lineTo(0, c.height / 2); ctx.lineTo(-c.width / 2, 0); ctx.closePath();
      ctx.fillStyle = '#00f7ff'; ctx.fill(); this._outline(ctx, '#006688', 2);
    } else {
      const icons: Record<string, string> = { shield: '🛡', rapidfire: '⚡', nuke: '💥', multiplier: '×2' };
      const colors: Record<string, string> = { shield: '#2244cc', rapidfire: '#cc5500', nuke: '#aa0000', multiplier: '#44aa44' };
      const glows: Record<string, string> = { shield: '#4488ff', rapidfire: '#ff8800', nuke: '#ff0000', multiplier: '#00ff44' };
      this._glow(ctx, glows[c.type] ?? '#fff', 12);
      ctx.beginPath(); ctx.arc(0, 0, c.width / 2, 0, Math.PI * 2); ctx.fillStyle = colors[c.type] ?? '#888'; ctx.fill(); this._outline(ctx, '#000', 2);
      ctx.font = `bold ${c.width * 0.65}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(icons[c.type] ?? '?', 0, 1);
    }
    this._clearGlow(ctx); ctx.restore();
  }

  drawParticle(p: Particle) {
    const ctx = this.ctx;
    ctx.save(); ctx.globalAlpha = p.life / p.maxLife; ctx.fillStyle = p.color;
    ctx.shadowBlur = 6; ctx.shadowColor = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
}
