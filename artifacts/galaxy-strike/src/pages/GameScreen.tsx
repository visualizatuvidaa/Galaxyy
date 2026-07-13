import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameEngine } from '../game/engine';

interface GameScreenProps {
  onGameOver: (stats: any) => void;
  onExit: () => void;
}

export default function GameScreen({ onGameOver, onExit }: GameScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [hud, setHud] = useState({ hp: 100, maxHp: 100, score: 0, wave: 1, bossHp: 0, bossMaxHp: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const [waveBanner, setWaveBanner] = useState<{ text: string; sub: string; type: 'clear' | 'start' | 'boss' } | null>(null);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showBanner = useCallback((text: string, sub: string, type: 'clear' | 'start' | 'boss') => {
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    setWaveBanner({ text, sub, type });
    bannerTimer.current = setTimeout(() => setWaveBanner(null), 2200);
  }, []);

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
  }, [onGameOver, showBanner]);

  const togglePause = () => {
    if (engineRef.current) {
      engineRef.current.togglePause();
      setIsPaused(engineRef.current.isPaused);
    }
  };

  const hpPct = Math.max(0, (hud.hp / hud.maxHp) * 100);
  const hpColor = hpPct > 50 ? '#00f7ff' : hpPct > 25 ? '#ffaa00' : '#ff3366';

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
          <div className="text-xl text-white font-bold" style={{ textShadow: '0 0 10px #00f7ff' }}>
            {hud.score.toString().padStart(6, '0')}
          </div>
          <div className="text-sm text-purple-400 font-bold tracking-widest">
            OLEADA {hud.wave}
          </div>
        </div>
      </div>

      {/* Boss HP */}
      {hud.bossHp > 0 && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-72 pointer-events-none">
          <div className="text-[10px] text-red-400 font-bold text-center mb-1 tracking-widest animate-pulse">
            ⚠ JEFE ACTIVO ⚠
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

      {/* Pause Menu */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
          <h2 className="text-4xl font-black text-cyan-400 mb-2 tracking-widest" style={{ textShadow: '0 0 20px #00f7ff' }}>
            PAUSA
          </h2>
          <p className="text-gray-400 text-sm mb-10">Oleada {hud.wave} · {hud.score} pts</p>
          <button
            onClick={togglePause}
            className="bg-cyan-500 text-black px-10 py-4 rounded-xl font-black text-lg mb-4 w-52 active:scale-95 transition-transform"
          >
            ▶ CONTINUAR
          </button>
          <button
            onClick={onExit}
            className="text-gray-400 border border-gray-700 px-10 py-3 rounded-xl font-bold w-52 active:scale-95 transition-transform"
          >
            SALIR
          </button>
        </div>
      )}
    </div>
  );
}
