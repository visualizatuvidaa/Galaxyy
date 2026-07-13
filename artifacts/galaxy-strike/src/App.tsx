import React, { useState } from 'react';
import MainMenu from './pages/MainMenu';
import GameScreen from './pages/GameScreen';
import GameOver from './pages/GameOver';
import ShopScreen from './pages/ShopScreen';
import AchievementsScreen from './pages/AchievementsScreen';
import MissionsScreen from './pages/MissionsScreen';
import LeaderboardScreen from './pages/LeaderboardScreen';
import SettingsScreen from './pages/SettingsScreen';

type Screen = 'menu' | 'game' | 'gameover' | 'shop' | 'achievements' | 'missions' | 'leaderboard' | 'settings';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [gameStats, setGameStats] = useState({ score: 0, wave: 1, coins: 0, gems: 0, kills: 0 });

  const handleGameOver = (stats: { score: number; wave: number; coins: number; gems: number; kills: number }) => {
    setGameStats(stats);
    setCurrentScreen('gameover');
  };

  const nav = (s: Screen) => setCurrentScreen(s);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black select-none">
      {currentScreen === 'menu' && (
        <MainMenu onPlay={() => nav('game')} onNavigate={(s) => nav(s)} />
      )}
      {currentScreen === 'game' && (
        <GameScreen onGameOver={handleGameOver} onExit={() => nav('menu')} />
      )}
      {currentScreen === 'gameover' && (
        <GameOver stats={gameStats} onRetry={() => nav('game')} onMenu={() => nav('menu')} />
      )}
      {currentScreen === 'shop'         && <ShopScreen         onBack={() => nav('menu')} />}
      {currentScreen === 'achievements' && <AchievementsScreen onBack={() => nav('menu')} />}
      {currentScreen === 'missions'     && <MissionsScreen     onBack={() => nav('menu')} />}
      {currentScreen === 'leaderboard'  && <LeaderboardScreen  onBack={() => nav('menu')} />}
      {currentScreen === 'settings'     && <SettingsScreen     onBack={() => nav('menu')} />}
    </div>
  );
}

export default App;
