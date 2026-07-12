import React, { useEffect, useRef, useState } from 'react';
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

  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Set absolute size for canvas to match window
    const resize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', resize);
    resize();
    
    const engine = new GameEngine(canvasRef.current);
    engine.onGameOver = onGameOver;
    engine.onUpdateHUD = setHud;
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
      engine.stop();
    };
  }, []);

  const togglePause = () => {
    if (engineRef.current) {
      engineRef.current.togglePause();
      setIsPaused(engineRef.current.isPaused);
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full touch-none" />
      
      {/* HUD Overlay */}
      <div className="absolute top-0 left-0 w-full p-4 pointer-events-none flex justify-between items-start">
        {/* HP Bar */}
        <div className="w-32">
          <div className="text-xs text-cyan-400 font-bold mb-1">SHIELD {Math.ceil(Math.max(0, hud.hp))}</div>
          <div className="w-full h-3 bg-blue-950 border border-cyan-500 rounded overflow-hidden">
            <div 
              className="h-full bg-cyan-400 transition-all duration-200" 
              style={{ width: `${Math.max(0, (hud.hp / hud.maxHp) * 100)}%`, boxShadow: '0 0 10px #00f7ff' }}
            />
          </div>
        </div>
        
        {/* Pause Btn */}
        <button 
          onClick={togglePause} 
          className="pointer-events-auto w-10 h-10 panel-bg rounded-full flex items-center justify-center text-cyan-400 font-bold"
        >
          ||
        </button>
        
        {/* Score & Wave */}
        <div className="text-right">
          <div className="text-xl text-white font-bold neon-text-cyan">{hud.score.toString().padStart(6, '0')}</div>
          <div className="text-sm text-purple-400 font-bold neon-text-purple">WAVE {hud.wave}</div>
        </div>
      </div>
      
      {/* Boss HP Bar */}
      {hud.bossHp > 0 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-64 pointer-events-none">
          <div className="text-xs text-red-500 font-bold text-center mb-1 uppercase tracking-widest">WARNING: BOSS ENGAGED</div>
          <div className="w-full h-2 bg-red-950 border border-red-500 rounded overflow-hidden">
            <div 
              className="h-full bg-red-500 transition-all" 
              style={{ width: `${(hud.bossHp / hud.bossMaxHp) * 100}%`, boxShadow: '0 0 10px #ff3366' }}
            />
          </div>
        </div>
      )}

      {/* Pause Menu Overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center pointer-events-auto backdrop-blur-sm z-50">
          <h2 className="text-4xl font-bold text-cyan-400 mb-8 neon-text-cyan tracking-widest">PAUSED</h2>
          <button 
            onClick={togglePause}
            className="panel-bg text-white px-8 py-3 rounded text-xl font-bold mb-4 active:scale-95 transition-transform"
          >
            RESUME
          </button>
          <button 
            onClick={onExit}
            className="text-gray-400 px-8 py-3 rounded font-bold active:scale-95 transition-transform"
          >
            QUIT TO MENU
          </button>
        </div>
      )}
    </div>
  );
}
