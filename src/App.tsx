import { useArenaStore } from './game/useArenaStore';
import { BurdenArena } from './components/arena/BurdenArena';
import { MainMenu } from './components/arena/MainMenu';
import { LevelUpPicker } from './components/arena/LevelUpPicker';
import { GameHUD } from './components/arena/GameHUD';
import { RunEndScreen } from './components/arena/RunEndScreen';
import { MetaShop } from './components/arena/MetaShop';
import { ArenaSettings } from './components/arena/ArenaSettings';
import { PauseOverlay } from './components/arena/PauseOverlay';
import { TutorialOverlay } from './components/arena/TutorialOverlay';
import { CodexModal } from './components/arena/CodexModal';
import { MeldDiscoveryPopup } from './components/arena/MeldDiscoveryPopup';

export default function App() {
  const store = useArenaStore();
  const {
    meta,
    screen,
    arenaRef,
    runStats,
    lastMeld,
    startRun,
    pickLevelUp,
    openShop,
    openSettings,
    backToMenu,
    resume,
    closeCodex,
    buyUpgrade,
    buyStartCharm,
    setMusicVolume,
    toggleMute,
    toggleCrt,
    hudTick,
    dismissTutorialStep,
    skipTutorial,
    dismissMeldPopup,
    buildDef,
  } = store;

  const arena = arenaRef.current;
  const playing = screen === 'playing' || screen === 'paused' || screen === 'codex';

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
          <BurdenArena
            arenaRef={arenaRef}
            active={screen === 'playing' || screen === 'codex'}
            crtScanlines={meta.settings.crtScanlines}
          />
          <GameHUD arenaRef={arenaRef} tick={hudTick} buildDef={buildDef} />
          {screen === 'playing' && arena?.tutorialStep && (
            <TutorialOverlay
              stepId={arena.tutorialStep}
              onNext={dismissTutorialStep}
              onSkipAll={skipTutorial}
            />
          )}
        </>
      )}

      {screen === 'codex' && (
        <CodexModal discoveredMelds={meta.discoveredMelds} onClose={closeCodex} />
      )}

      {screen === 'playing' && lastMeld && (
        <MeldDiscoveryPopup charmId={lastMeld} onDismiss={dismissMeldPopup} />
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
          crtScanlines={meta.settings.crtScanlines}
          onSetVolume={setMusicVolume}
          onToggleMute={toggleMute}
          onToggleCrt={toggleCrt}
          onBack={backToMenu}
        />
      )}
    </div>
  );
}
