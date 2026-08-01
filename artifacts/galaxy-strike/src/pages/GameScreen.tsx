import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameEngine } from '../game/engine';
import { loadSave, saveGame } from '../game/storage';
import { getStoryScene, StoryScene } from '../game/story';
import { audio } from '../game/audio';

interface GameScreenProps {
  onGameOver: (stats: any) => void;
  onExit: () => void;
}

const STORY_VISUAL_VARIANTS: Record<number, {
  background: string;
  rays: string;
  panel: string;
  side: string;
  badge: string;
}> = {
  1: {
    background: 'radial-gradient(circle at top, rgba(0,247,255,0.35), transparent 40%), linear-gradient(135deg, #020617 0%, #061c2c 45%, #020617 100%)',
    rays: 'linear-gradient(120deg, rgba(0,247,255,0.35), transparent 30%, transparent 70%, rgba(0,247,255,0.22))',
    panel: 'rgba(5,16,31,0.84)',
    side: 'rgba(0,247,255,0.12)',
    badge: 'rgba(0,247,255,0.22)',
  },
  2: {
    background: 'radial-gradient(circle at top, rgba(255,95,109,0.34), transparent 40%), linear-gradient(135deg, #120603 0%, #30120c 45%, #160703 100%)',
    rays: 'linear-gradient(120deg, rgba(255,95,109,0.38), transparent 30%, transparent 70%, rgba(255,150,80,0.22))',
    panel: 'rgba(32,10,4,0.84)',
    side: 'rgba(255,95,109,0.14)',
    badge: 'rgba(255,95,109,0.24)',
  },
  3: {
    background: 'radial-gradient(circle at top, rgba(112,240,255,0.32), transparent 40%), linear-gradient(135deg, #020813 0%, #102540 45%, #03111d 100%)',
    rays: 'linear-gradient(120deg, rgba(112,240,255,0.38), transparent 30%, transparent 70%, rgba(145,164,255,0.24))',
    panel: 'rgba(5,12,24,0.86)',
    side: 'rgba(112,240,255,0.14)',
    badge: 'rgba(112,240,255,0.22)',
  },
  4: {
    background: 'radial-gradient(circle at top, rgba(139,92,246,0.34), transparent 40%), linear-gradient(135deg, #080511 0%, #1f1238 45%, #090611 100%)',
    rays: 'linear-gradient(120deg, rgba(139,92,246,0.38), transparent 30%, transparent 70%, rgba(167,139,250,0.24))',
    panel: 'rgba(13,6,25,0.86)',
    side: 'rgba(139,92,246,0.14)',
    badge: 'rgba(139,92,246,0.24)',
  },
  5: {
    background: 'radial-gradient(circle at top, rgba(56,189,248,0.34), transparent 40%), linear-gradient(135deg, #04121e 0%, #0c3958 45%, #051220 100%)',
    rays: 'linear-gradient(120deg, rgba(56,189,248,0.38), transparent 30%, transparent 70%, rgba(99,102,241,0.24))',
    panel: 'rgba(3,17,31,0.86)',
    side: 'rgba(56,189,248,0.16)',
    badge: 'rgba(56,189,248,0.24)',
  },
  6: {
    background: 'radial-gradient(circle at top, rgba(249,115,22,0.34), transparent 40%), linear-gradient(135deg, #120a04 0%, #311408 45%, #120904 100%)',
    rays: 'linear-gradient(120deg, rgba(249,115,22,0.38), transparent 30%, transparent 70%, rgba(251,191,36,0.22))',
    panel: 'rgba(28,11,2,0.86)',
    side: 'rgba(249,115,22,0.16)',
    badge: 'rgba(249,115,22,0.24)',
  },
  7: {
    background: 'radial-gradient(circle at top, rgba(52,211,153,0.36), transparent 40%), linear-gradient(135deg, #04110b 0%, #113b2a 45%, #05120a 100%)',
    rays: 'linear-gradient(120deg, rgba(52,211,153,0.4), transparent 30%, transparent 70%, rgba(34,197,94,0.22))',
    panel: 'rgba(3,17,11,0.86)',
    side: 'rgba(52,211,153,0.16)',
    badge: 'rgba(52,211,153,0.24)',
  },
  8: {
    background: 'radial-gradient(circle at top, rgba(217,70,239,0.34), transparent 40%), linear-gradient(135deg, #0b0612 0%, #240c32 45%, #09050d 100%)',
    rays: 'linear-gradient(120deg, rgba(217,70,239,0.38), transparent 30%, transparent 70%, rgba(168,85,247,0.24))',
    panel: 'rgba(18,6,24,0.86)',
    side: 'rgba(217,70,239,0.16)',
    badge: 'rgba(217,70,239,0.24)',
  },
  9: {
    background: 'radial-gradient(circle at top, rgba(251,113,133,0.34), transparent 40%), linear-gradient(135deg, #13070c 0%, #3a1121 45%, #14070b 100%)',
    rays: 'linear-gradient(120deg, rgba(251,113,133,0.38), transparent 30%, transparent 70%, rgba(244,63,94,0.22))',
    panel: 'rgba(26,6,12,0.86)',
    side: 'rgba(251,113,133,0.16)',
    badge: 'rgba(251,113,133,0.24)',
  },
  10: {
    background: 'radial-gradient(circle at top, rgba(168,85,247,0.36), transparent 42%), linear-gradient(135deg, #080514 0%, #24104d 46%, #05020d 100%)',
    rays: 'linear-gradient(120deg, rgba(168,85,247,0.42), transparent 30%, transparent 70%, rgba(88,28,135,0.26))',
    panel: 'rgba(12,6,24,0.88)',
    side: 'rgba(168,85,247,0.18)',
    badge: 'rgba(168,85,247,0.24)',
  },
};

const getStoryVariant = (key: string, accent: string) => {
  const world = Number((key.match(/world-(\d+)/)?.[1] ?? '1'));
  const palette = STORY_VISUAL_VARIANTS[world] ?? STORY_VISUAL_VARIANTS[1];

  return {
    ...palette,
    accent,
  };
};

export default function GameScreen({ onGameOver, onExit }: GameScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [hud, setHud] = useState({ hp: 100, maxHp: 100, score: 0, wave: 1, world: 1, worldName: 'Helios Verge', worldSubtitle: 'Nebulosa de inicio', bossName: '', bossHp: 0, bossMaxHp: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const [worldComplete, setWorldComplete] = useState<{
    world: number;
    score: number;
    coins: number;
    gems: number;
    kills: number;
    nextWorld: number;
  } | null>(null);
  const [waveBanner, setWaveBanner] = useState<{ text: string; sub: string; type: 'clear' | 'start' | 'boss' } | null>(null);
  const [story, setStory] = useState<StoryScene | null>(null);
  const [storyLine, setStoryLine] = useState(0);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storyOnCompleteRef = useRef<(() => void) | null>(null);

  const showBanner = useCallback((text: string, sub: string, type: 'clear' | 'start' | 'boss') => {
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    setWaveBanner({ text, sub, type });
    bannerTimer.current = setTimeout(() => setWaveBanner(null), 2200);
  }, []);

  const pauseEngine = useCallback(() => {
    if (engineRef.current && !engineRef.current.isPaused) {
      engineRef.current.togglePause();
      setIsPaused(true);
    }
  }, []);

  const resumeEngine = useCallback(() => {
    if (engineRef.current && engineRef.current.isPaused) {
      engineRef.current.togglePause();
      setIsPaused(false);
    }
  }, []);

  const closeStory = useCallback(() => {
    setStory(null);
    setStoryLine(0);
    const onDone = storyOnCompleteRef.current;
    storyOnCompleteRef.current = null;
    resumeEngine();
    onDone?.();
  }, [resumeEngine]);

  const playStoryOnce = useCallback((key: string, onComplete?: () => void) => {
    const scene = getStoryScene(key);
    if (!scene) {
      onComplete?.();
      return;
    }

    const save = loadSave();
    const seen = save.seenCinematics ?? [];
    if (seen.includes(key)) {
      onComplete?.();
      return;
    }

    saveGame({ seenCinematics: [...seen, key] });
    storyOnCompleteRef.current = onComplete ?? null;
    setStory(scene);
    setStoryLine(0);
    pauseEngine();
    audio.playStoryCinematic();
  }, [pauseEngine]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const engine = new GameEngine(canvas);
    engine.onGameOver = onGameOver;
    engine.onUpdateHUD = setHud;
    engine.onWorldComplete = (world: number, stats: any) => {
      setWorldComplete({
        world,
        score: stats.score,
        coins: stats.coins,
        gems: stats.gems,
        kills: stats.kills,
        nextWorld: stats.nextWorld,
      });
      setIsPaused(true);
    };

    engine.onWaveClear = (wave: number) => {
      if (wave % 5 === 0) {
        showBanner('¡JEFE DERROTADO!', `Oleada ${wave} completada`, 'boss');
      } else {
        showBanner('¡OLEADA COMPLETA!', `Oleada ${wave} superada`, 'clear');
      }
    };

    engine.onWaveStart = (wave: number) => {
      const waveConf = { number: wave, isBoss: wave % 5 === 0 };
      if (waveConf.isBoss) {
        showBanner('⚠ ALERTA DE JEFE ⚠', `Oleada ${wave} — JEFE`, 'boss');
      } else if (wave > 1) {
        showBanner(`OLEADA ${wave}`, 'Prepárate…', 'start');
      }
    };

    engineRef.current = engine;
    engine.start();
    playStoryOnce('intro-world-1');

    const handleVisibility = () => {
      if (document.hidden && engineRef.current && !engineRef.current.isPaused) {
        engineRef.current.togglePause();
        setIsPaused(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (bannerTimer.current) clearTimeout(bannerTimer.current);
      engine.stop();
    };
  }, [onGameOver, playStoryOnce, showBanner]);

  const togglePause = () => {
    if (worldComplete) return;
    if (engineRef.current) {
      engineRef.current.togglePause();
      setIsPaused(engineRef.current.isPaused);
    }
  };

  const continueToNextWorld = () => {
    if (!engineRef.current || !worldComplete) return;
    const currentWorld = worldComplete.world;
    const nextWorld = worldComplete.nextWorld;
    setWorldComplete(null);

    playStoryOnce(`ending-world-${currentWorld}`, () => {
      engineRef.current?.startWorld(nextWorld);
      playStoryOnce(`intro-world-${nextWorld}`);
    });
  };

  useEffect(() => {
    if (!story) return;
    const timer = window.setTimeout(() => {
      if (storyLine < story.lines.length - 1) {
        setStoryLine((prev) => prev + 1);
        audio.playCoin();
      } else {
        closeStory();
      }
    }, 2600);
    return () => window.clearTimeout(timer);
  }, [story, storyLine, closeStory]);

  const storyProgress = story ? ((storyLine + 1) / story.lines.length) * 100 : 0;
  const storyVisual = story ? getStoryVariant(story.key, story.accent) : null;
  const hpPct = Math.max(0, (hud.hp / hud.maxHp) * 100);
  const hpColor = hpPct > 50 ? '#00f7ff' : hpPct > 25 ? '#ffaa00' : '#ff3366';

  const persistPauseSave = () => {
    const current = loadSave();
    const nextHighScore = Math.max(current.highScore || 0, hud.score || 0);
    const nextHighWave = Math.max(current.highWave || 1, hud.wave || 1);
    const world = Math.max(1, hud.world || 1);
    saveGame({
      currentWorld: world,
      highScore: nextHighScore,
      highWave: nextHighWave,
    });
  };

  const saveAndContinue = () => {
    persistPauseSave();
    togglePause();
  };

  const saveAndExit = () => {
    persistPauseSave();
    onExit();
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full touch-none" />

      {/* HUD */}
      <div className="absolute top-0 left-0 w-full px-4 pt-10 pb-2 pointer-events-none flex justify-between items-start">
        {/* HP */}
        <div className="w-36">
          <div className="text-[10px] text-cyan-400 font-bold mb-1 tracking-widest">
            ESCUDO {Math.ceil(Math.max(0, hud.hp))}
          </div>
          <div className="w-full h-3 bg-blue-950 border border-cyan-500/60 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{ width: `${hpPct}%`, backgroundColor: hpColor, boxShadow: `0 0 8px ${hpColor}` }}
            />
          </div>
        </div>

        {/* Pause */}
        <button
          onClick={togglePause}
          className="pointer-events-auto w-10 h-10 bg-black/60 border border-cyan-500/40 rounded-full
                     flex items-center justify-center text-cyan-400 font-bold text-lg backdrop-blur"
        >
          ⏸
        </button>

        {/* Score & Wave */}
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-[0.32em] text-cyan-300 mb-1">{hud.worldName}</div>
          <div className="text-xl text-white font-bold" style={{ textShadow: '0 0 10px #00f7ff' }}>
            {hud.score.toString().padStart(6, '0')}
          </div>
          <div className="text-sm text-purple-400 font-bold tracking-widest">
            OLEADA {hud.wave}
          </div>
          <div className="text-[10px] text-gray-300 mt-1">{hud.worldSubtitle}</div>
        </div>
      </div>

      {/* Boss HP */}
      {hud.bossHp > 0 && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-72 pointer-events-none">
          <div className="text-[10px] text-red-400 font-bold text-center mb-1 tracking-widest animate-pulse">
            ⚠ {hud.bossName || 'JEFE ACTIVO'} ⚠
          </div>
          <div className="w-full h-3 bg-red-950 border border-red-500/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all rounded-full"
              style={{ width: `${(hud.bossHp / hud.bossMaxHp) * 100}%`, boxShadow: '0 0 10px #ff3366' }}
            />
          </div>
        </div>
      )}

      {/* Wave Banner */}
      <AnimatePresence>
        {waveBanner && (
          <motion.div
            key={waveBanner.text}
            initial={{ opacity: 0, scale: 0.7, y: -30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="absolute inset-x-0 top-1/3 flex flex-col items-center pointer-events-none z-40"
          >
            <div
              className={`px-8 py-4 rounded-2xl text-center backdrop-blur-md border
                ${waveBanner.type === 'boss'
                  ? 'border-red-400/70 bg-red-900/60 shadow-[0_0_40px_#ff336666]'
                  : waveBanner.type === 'clear'
                  ? 'border-cyan-400/70 bg-cyan-900/60 shadow-[0_0_40px_#00f7ff66]'
                  : 'border-purple-400/70 bg-purple-900/60 shadow-[0_0_40px_#bf00ff44]'
                }`}
            >
              <div
                className={`text-3xl font-black tracking-widest uppercase ${
                  waveBanner.type === 'boss' ? 'text-red-300' : waveBanner.type === 'clear' ? 'text-cyan-300' : 'text-purple-300'
                }`}
              >
                {waveBanner.text}
              </div>
              <div className="text-sm text-white/70 mt-1 font-semibold">{waveBanner.sub}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story Overlay */}
      <AnimatePresence>
        {story && storyVisual && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-60 flex items-center justify-center px-4 backdrop-blur-md overflow-hidden"
            style={{ background: storyVisual.background }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.85, 0] }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="absolute inset-0"
              style={{ background: `radial-gradient(circle at center, ${storyVisual.accent}55 0%, transparent 50%)` }}
            />

            <div className="absolute inset-0 opacity-80">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_45%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.1),transparent_40%)]" />
              <div className="absolute inset-0"
                style={{
                  backgroundImage: storyVisual.rays,
                  filter: 'blur(12px)',
                  opacity: 0.68,
                }}
              />
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="absolute rounded-full blur-2xl"
                  style={{
                    width: `${34 + (i % 4) * 24}px`,
                    height: `${34 + (i % 4) * 24}px`,
                    top: `${8 + (i * 7) % 76}%`,
                    left: `${1 + (i * 11) % 94}%`,
                    background: storyVisual.accent,
                    opacity: 0.1 + (i % 5) * 0.03,
                    animation: `pulse ${3.6 + (i % 3) * 0.6}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>

            <div
              className="relative w-[min(92vw,760px)] rounded-[30px] border border-white/10 p-6 shadow-[0_0_70px_rgba(0,247,255,0.18)] overflow-hidden"
              style={{ background: storyVisual.panel }}
            >
              <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${storyVisual.accent}, transparent)` }} />

              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.5em] mb-2" style={{ color: storyVisual.accent }}>
                    {story.subtitle}
                  </div>
                  <motion.h2
                    initial={{ opacity: 0, y: 18, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="text-4xl md:text-5xl font-black text-white tracking-[0.18em]"
                    style={{ textShadow: `0 0 26px ${storyVisual.accent}` }}
                  >
                    {story.title}
                  </motion.h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-gray-300">
                  CINEMÁTICA
                </div>
              </div>

              <div className="mb-4 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${storyProgress}%`, background: storyVisual.accent, boxShadow: `0 0 16px ${storyVisual.accent}` }} />
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {story.lines.map((_, idx) => (
                  <div key={`${story.key}-step-${idx}`} className="h-1.5 rounded-full transition-all duration-300" style={{ background: idx <= storyLine ? storyVisual.accent : 'rgba(255,255,255,0.1)' }} />
                ))}
              </div>

              <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-4 items-stretch">
                <div className="space-y-3 min-h-[210px] text-sm text-slate-200 leading-6">
                  {story.lines.slice(0, storyLine + 1).map((line, idx) => (
                    <motion.div
                      key={`${story.key}-${idx}`}
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.35 }}
                      className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm"
                    >
                      <div className="mb-1 text-[10px] uppercase tracking-[0.32em] text-white/50">Fragmento {idx + 1}</div>
                      <div className="text-base text-white/90">{line}</div>
                    </motion.div>
                  ))}
                </div>

                <div className="rounded-[22px] border border-white/10 p-4 flex flex-col justify-between" style={{ background: storyVisual.side }}>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.4em] text-white/45 mb-3">Señal del mundo</div>
                    <div className="text-2xl font-black text-white mb-2" style={{ color: storyVisual.accent }}>
                      {story.title}
                    </div>
                    <div className="text-sm text-slate-300 leading-6">
                      La narrativa se revela como una transmisión del cosmos. Cada mundo tiene su propio brillo, luz y tono visual para distinguir claramente cada capítulo.
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/10 p-3" style={{ background: storyVisual.badge }}>
                    <div className="text-[10px] uppercase tracking-[0.32em] text-white/45">Progreso</div>
                    <div className="text-xl font-black text-white mt-1">{storyLine + 1}/{story.lines.length}</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-between gap-3 items-center">
                <div className="text-[10px] uppercase tracking-[0.35em] text-gray-400">
                  {storyLine + 1}/{story.lines.length}
                </div>
                <button onClick={closeStory} className="px-4 py-2 rounded-xl border border-cyan-400/50 text-cyan-300 font-black text-sm active:scale-95">OMITIR</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* World Complete Overlay */}
      <AnimatePresence>
        {worldComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 flex items-center justify-center z-50 backdrop-blur-sm"
          >
            <div className="w-[min(92vw,520px)] rounded-3xl border border-cyan-400/60 bg-slate-950/90 p-8 shadow-[0_0_50px_rgba(0,247,255,0.25)]">
              <div className="text-center mb-6">
                <div className="text-xs uppercase tracking-[0.45em] text-cyan-300">{worldComplete.world >= 10 ? 'NUEVO JUEGO+' : `Mundo ${worldComplete.world} completado`}</div>
                <h2 className="text-3xl font-black text-white mt-2">{worldComplete.world >= 10 ? 'MODO NG+' : 'NIVEL SUPERADO'}</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm text-white mb-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-cyan-300 font-bold">Puntuación</div>
                  <div className="text-xl font-black">{worldComplete.score}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-amber-300 font-bold">Monedas</div>
                  <div className="text-xl font-black">{worldComplete.coins}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-violet-300 font-bold">Enemigos</div>
                  <div className="text-xl font-black">{worldComplete.kills}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-emerald-300 font-bold">Gemas</div>
                  <div className="text-xl font-black">{worldComplete.gems}</div>
                </div>
              </div>

              <button
                onClick={continueToNextWorld}
                className="w-full bg-cyan-400 text-slate-950 px-6 py-4 rounded-2xl font-black text-lg active:scale-95 transition-transform"
              >
                CONTINUAR
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause Menu */}
      {isPaused && !worldComplete && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
          <h2 className="text-4xl font-black text-cyan-400 mb-2 tracking-widest" style={{ textShadow: '0 0 20px #00f7ff' }}>
            PAUSA
          </h2>
          <p className="text-gray-400 text-sm mb-10">Oleada {hud.wave} · {hud.score} pts</p>
          <button
            onClick={saveAndContinue}
            className="bg-cyan-500 text-black px-10 py-4 rounded-xl font-black text-lg mb-3 w-60 active:scale-95 transition-transform"
          >
            💾 GUARDAR Y CONTINUAR
          </button>
          <button
            onClick={saveAndExit}
            className="bg-slate-900 text-white border border-cyan-500/40 px-10 py-3 rounded-xl font-bold w-60 active:scale-95 transition-transform mb-3"
          >
            💾 GUARDAR Y SALIR
          </button>
          <button
            onClick={togglePause}
            className="text-gray-300 border border-gray-700 px-10 py-3 rounded-xl font-bold w-60 active:scale-95 transition-transform"
          >
            ▶ CONTINUAR
          </button>
        </div>
      )}
    </div>
  );
}
