import React, { useState } from 'react';
import MainMenu from './pages/MainMenu';
import GameScreen from './pages/GameScreen';
import GameOver from './pages/GameOver';
import ShopScreen from './pages/ShopScreen';
import AchievementsScreen from './pages/AchievementsScreen';
import MissionsScreen from './pages/MissionsScreen';

type Screen = 'menu' | 'game' | 'gameover' | 'shop' | 'achievements' | 'missions';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [gameStats, setGameStats] = useState({ score: 0, wave: 1, coins: 0 });

  const handleGameOver = (stats: { score: number; wave: number; coins: number }) => {
    setGameStats(stats);
    setCurrentScreen('gameover');
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-black select-none">
      {currentScreen === 'menu' && (
        <MainMenu 
          onPlay={() => setCurrentScreen('game')} 
          onNavigate={(s) => setCurrentScreen(s)} 
        />
      )}
      
      {currentScreen === 'game' && (
        <GameScreen 
          onGameOver={handleGameOver} 
          onExit={() => setCurrentScreen('menu')}
        />
      )}
      
      {currentScreen === 'gameover' && (
        <GameOver 
          stats={gameStats}
          onRetry={() => setCurrentScreen('game')}
          onMenu={() => setCurrentScreen('menu')}
        />
      )}
      
      {currentScreen === 'shop' && <ShopScreen onBack={() => setCurrentScreen('menu')} />}
      
      {currentScreen === 'achievements' && <AchievementsScreen onBack={() => setCurrentScreen('menu')} />}
      
      {currentScreen === 'missions' && <MissionsScreen onBack={() => setCurrentScreen('menu')} />}
    </div>
  );
}

export default App;
