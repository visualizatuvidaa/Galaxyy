class AudioSystem {
  ctx: AudioContext | null = null;
  enabled: boolean = true;
  theme: string = 'neon';
  themeProfiles: Record<string, { laser: [number, number]; explosion: [number, number]; coin: [number, number]; powerUp: [number, number]; hit: [number, number] }> = {
    neon: { laser: [800, 400], explosion: [500, 1000], coin: [1200, 1800], powerUp: [400, 1200], hit: [150, 50] },
    ember: { laser: [680, 320], explosion: [220, 700], coin: [900, 1400], powerUp: [300, 900], hit: [120, 40] },
    ion: { laser: [900, 550], explosion: [700, 1200], coin: [1350, 2100], powerUp: [500, 1500], hit: [180, 60] },
    void: { laser: [520, 260], explosion: [240, 580], coin: [1100, 1700], powerUp: [300, 1100], hit: [130, 45] },
    storm: { laser: [850, 450], explosion: [600, 1150], coin: [1500, 2100], powerUp: [450, 1300], hit: [170, 55] },
    obsidian: { laser: [620, 300], explosion: [180, 520], coin: [950, 1600], powerUp: [350, 900], hit: [130, 45] },
    aurora: { laser: [760, 380], explosion: [650, 1300], coin: [1500, 2200], powerUp: [460, 1400], hit: [160, 50] },
    shadow: { laser: [480, 250], explosion: [180, 500], coin: [1000, 1600], powerUp: [250, 850], hit: [115, 35] },
    eclipse: { laser: [600, 280], explosion: [200, 480], coin: [1100, 1800], powerUp: [320, 900], hit: [120, 40] },
    astral: { laser: [820, 430], explosion: [700, 1400], coin: [1350, 2200], powerUp: [420, 1300], hit: [150, 45] },
  };

  setTheme(theme: string) {
    this.theme = this.themeProfiles[theme] ? theme : 'neon';
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playLaser() {
    if (!this.ctx || !this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const profile = this.themeProfiles[this.theme] ?? this.themeProfiles.neon;
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(profile.laser[0], this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(profile.laser[1], this.ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playExplosion(large: boolean = false) {
    if (!this.ctx || !this.enabled) return;
    const duration = large ? 0.3 : 0.1;
    const profile = this.themeProfiles[this.theme] ?? this.themeProfiles.neon;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    // lowpass filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = large ? profile.explosion[0] : profile.explosion[1];
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(large ? 0.5 : 0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    noise.start();
  }

  playCoin() {
    if (!this.ctx || !this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const profile = this.themeProfiles[this.theme] ?? this.themeProfiles.neon;
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(profile.coin[0], this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(profile.coin[1], this.ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }
  
  playPowerUp() {
    if (!this.ctx || !this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const profile = this.themeProfiles[this.theme] ?? this.themeProfiles.neon;
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(profile.powerUp[0], this.ctx.currentTime);
    osc.frequency.setValueAtTime(profile.powerUp[0] + 200, this.ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(profile.powerUp[1], this.ctx.currentTime + 0.2);
    osc.frequency.setValueAtTime(profile.powerUp[1] + 300, this.ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  playStoryCinematic() {
    if (!this.ctx || !this.enabled) return;
    const profile = this.themeProfiles[this.theme] ?? this.themeProfiles.neon;

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc2.type = 'triangle';
    osc.frequency.setValueAtTime(profile.powerUp[0], this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(profile.powerUp[1], this.ctx.currentTime + 0.45);
    osc2.frequency.setValueAtTime(profile.powerUp[0] + 110, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(profile.powerUp[1] + 180, this.ctx.currentTime + 0.45);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.24, this.ctx.currentTime + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.55);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc2.start();
    osc.stop(this.ctx.currentTime + 0.55);
    osc2.stop(this.ctx.currentTime + 0.55);
  }
  
  playPlayerHit() {
    if (!this.ctx || !this.enabled) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const profile = this.themeProfiles[this.theme] ?? this.themeProfiles.neon;
    
    osc1.type = 'sawtooth';
    osc2.type = 'square';
    osc1.frequency.setValueAtTime(profile.hit[0], this.ctx.currentTime);
    osc2.frequency.setValueAtTime(profile.hit[0] + 5, this.ctx.currentTime);
    
    osc1.frequency.exponentialRampToValueAtTime(profile.hit[1], this.ctx.currentTime + 0.3);
    osc2.frequency.exponentialRampToValueAtTime(profile.hit[1], this.ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.3);
    osc2.stop(this.ctx.currentTime + 0.3);
  }
}

export const audio = new AudioSystem();
