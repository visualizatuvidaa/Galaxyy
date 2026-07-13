import React, { useState } from 'react';
import { loadSave, saveGame } from '../game/storage';

interface Props { onBack: () => void; }

export default function SettingsScreen({ onBack }: Props) {
  const [settings, setSettings] = useState(loadSave().settings);

  const toggle = (key: 'soundEnabled' | 'vibrationEnabled') => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    saveGame({ settings: next });
  };

  const resetProgress = () => {
    if (window.confirm('¿Seguro que quieres borrar todo el progreso? Esta acción no se puede deshacer.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="w-full h-full bg-[#020818] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 pt-10 pb-6 shrink-0">
        <button onClick={onBack}
          className="bg-[#0a1830] border border-cyan-500/40 text-cyan-400 font-bold px-4 py-2.5 rounded-xl text-sm active:scale-95 transition-transform">
          ← Volver
        </button>
        <div className="text-white font-black text-xl tracking-widest" style={{ textShadow: '0 0 12px #888' }}>
          ⚙️ AJUSTES
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-4">

        {/* Toggle rows */}
        {[
          { key: 'soundEnabled' as const, label: 'Sonido', icon: '🔊', desc: 'Efectos de sonido del juego' },
          { key: 'vibrationEnabled' as const, label: 'Vibración', icon: '📳', desc: 'Vibración al recibir daño' },
        ].map(({ key, label, icon, desc }) => (
          <div key={key} className="bg-[#0a1830] border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <span className="text-3xl">{icon}</span>
            <div className="flex-1">
              <div className="text-white font-bold">{label}</div>
              <div className="text-xs text-gray-500">{desc}</div>
            </div>
            <button
              onClick={() => toggle(key)}
              className={`w-14 h-7 rounded-full border-2 transition-all relative ${
                settings[key] ? 'bg-cyan-500 border-cyan-400' : 'bg-white/10 border-white/20'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                settings[key] ? 'right-0.5' : 'left-0.5'
              }`} />
            </button>
          </div>
        ))}

        {/* Info */}
        <div className="bg-[#0a1830] border border-white/10 rounded-2xl p-4 space-y-3">
          <h3 className="text-white font-black uppercase tracking-wider text-sm">Acerca del Juego</h3>
          <div className="text-sm text-gray-400 space-y-1">
            <div className="flex justify-between"><span>Versión</span><span className="text-white">v1.1 Legacy Edition</span></div>
            <div className="flex justify-between"><span>Estudio</span><span className="text-white">Thaguan Studio</span></div>
            <div className="flex justify-between"><span>Motor</span><span className="text-white">Canvas 2D Personalizado</span></div>
          </div>
        </div>

        {/* Share */}
        <div className="bg-[#0a1830] border border-purple-500/30 rounded-2xl p-4">
          <h3 className="text-white font-black uppercase tracking-wider text-sm mb-3">Comparte el Juego</h3>
          <button
            onClick={async () => {
              const text = '🚀 ¡Estoy jugando Galaxy Strike: Legacy! Un shooter espacial épico. ¡Juega gratis!';
              if (navigator.share) {
                try { await navigator.share({ title: 'Galaxy Strike: Legacy', text }); } catch (_) {}
              } else {
                await navigator.clipboard.writeText(text);
                alert('¡Texto copiado al portapapeles!');
              }
            }}
            className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform"
          >
            📤 Compartir Galaxy Strike
          </button>
        </div>

        {/* Danger zone */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4">
          <h3 className="text-red-400 font-black uppercase tracking-wider text-sm mb-2">Zona de Peligro</h3>
          <p className="text-xs text-gray-500 mb-3">Borrar todo el progreso, monedas, gemas y logros. No se puede deshacer.</p>
          <button
            onClick={resetProgress}
            className="w-full bg-red-900/60 border border-red-500/50 text-red-400 font-bold py-3 rounded-xl active:scale-95 transition-transform"
          >
            🗑 Borrar Todo el Progreso
          </button>
        </div>
      </div>
    </div>
  );
}
