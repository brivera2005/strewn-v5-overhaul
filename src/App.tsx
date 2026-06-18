import { useArenaStore } from './game/useArenaStore';
import { ArenaCanvas } from './components/arena/ArenaCanvas';
import { MainMenu } from './components/arena/MainMenu';
import { LevelUpPicker } from './components/arena/LevelUpPicker';
import { GameHUD } from './components/arena/GameHUD';
import { RunEndScreen } from './components/arena/RunEndScreen';
import { MetaShop } from './components/arena/MetaShop';
import { ArenaSettings } from './components/arena/ArenaSettings';
import { PauseOverlay } from './components/arena/PauseOverlay';

export default function App() {
  const store = useArenaStore();
  const {
    meta,
    screen,
    arenaRef,
    runStats,
    startRun,
    pickLevelUp,
    openShop,
    openSettings,
    backToMenu,
    resume,
    buyUpgrade,
    buyStartCharm,
    setMusicVolume,
    toggleMute,
    hudTick,
  } = store;

  const arena = arenaRef.current;
  const playing = screen === 'playing' || screen === 'paused';

  return (
    <div className="app">
      {screen === 'menu' && (
        <MainMenu
          shards={meta.shards}
          totalRuns={meta.totalRuns}
          bestKills={meta.bestKills}
          onStart={startRun}
          onShop={openShop}
          onSettings={openSettings}
        />
      )}

      {playing && (
        <>
          <ArenaCanvas arenaRef={arenaRef} active={screen === 'playing'} />
          <GameHUD arenaRef={arenaRef} tick={hudTick} />
        </>
      )}

      {screen === 'paused' && (
        <PauseOverlay
          onResume={resume}
          onMenu={backToMenu}
          onSettings={openSettings}
        />
      )}

      {screen === 'levelup' && arena && (
        <LevelUpPicker choices={arena.levelUpChoices} onPick={pickLevelUp} />
      )}

      {(screen === 'gameover' || screen === 'victory') && runStats && (
        <RunEndScreen
          won={screen === 'victory'}
          stats={runStats}
          onRetry={startRun}
          onMenu={backToMenu}
          onShop={openShop}
        />
      )}

      {screen === 'shop' && (
        <MetaShop
          meta={meta}
          onBuy={buyUpgrade}
          onBuyCharm={buyStartCharm}
          onBack={backToMenu}
        />
      )}

      {screen === 'settings' && (
        <ArenaSettings
          musicVolume={meta.settings.musicVolume}
          muted={meta.settings.muted}
          onSetVolume={setMusicVolume}
          onToggleMute={toggleMute}
          onBack={backToMenu}
        />
      )}
    </div>
  );
}
