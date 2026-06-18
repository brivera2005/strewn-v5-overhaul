import { Header } from './components/Header';
import { StartScreen } from './components/StartScreen';
import { CyoaScreen } from './components/CyoaScreen';
import { PatientCard } from './components/PatientCard';
import { PainChannelCard } from './components/PainChannelCard';
import { FamilyMemberCard } from './components/FamilyMemberCard';
import { ControlBar } from './components/ControlBar';
import { DraggableTutorial } from './components/DraggableTutorial';
import { PathChoiceModal } from './components/PathChoiceModal';
import { ResultScreen } from './components/ResultScreen';
import { HelpModal } from './components/HelpModal';
import { TriageDashboard } from './components/TriageDashboard';
import { Overworld } from './components/Overworld';
import { SettingsModal } from './components/SettingsModal';
import { CreditsScreen } from './components/CreditsScreen';
import { ToastSystem } from './components/ToastSystem';
import { KeyboardShortcutsPanel } from './components/KeyboardShortcutsPanel';
import { PatientDetailDrawer } from './components/PatientDetailDrawer';
import { UpgradePicker } from './components/UpgradePicker';
import { LootPicker } from './components/LootPicker';
import { useGameStore } from './game/useGameStore';
import { VECTORS } from './game/constants';
import type { PainVector } from './game/constants';

export default function App() {
  const store = useGameStore();
  const {
    state,
    highlightPatientId,
    recommendedPatientId,
    startNewGame,
    continueGame,
    openSettings,
    openCredits,
    backToStart,
    cyoaChoose,
    cyoaAdvance,
    selectParticipant,
    assignToVector,
    togglePause,
    setSpeed,
    setMusicVolume,
    setSetting,
    toggleMute,
    choosePath,
    toggleHelp,
    restart,
    selectPatient,
    openDrawer,
    closeDrawer,
    setPatientPriority,
    setPatientFilter,
    setPatientSearch,
    sortPatients,
    setTriageTab,
    optimizeTriage,
    assignHelperToPatient,
    bulkAssignBest,
    bulkEndure,
    bulkSetPriority,
    dismissToast,
    pickUpgrade,
    pickLoot,
    unlockResearch,
    jumpToPatient,
    getAllocationForVector,
    getParticipantAllocation,
    closeCommandMenu,
  } = store;

  const { screen, ripple } = state;

  const isTutorialBlocking = (memberId: string) => {
    if (!state.tutorialStep) return false;
    if (state.tutorialStep === 'select_sarah') return memberId !== 'sarah';
    if (state.tutorialStep === 'assign_mike') return memberId !== 'mike';
    return false;
  };

  const latestLedger = state.ledger[0]?.humanReadable;
  const muted = state.settings.muted;
  const drawerPatient = state.drawerPatientId
    ? state.patients.find((p) => p.id === state.drawerPatientId) ?? null
    : null;

  return (
    <div className="app">
      {screen === 'start' && (
        <StartScreen
          hasSave={state.hasSave}
          onNewGame={startNewGame}
          onContinue={continueGame}
          onSettings={openSettings}
          onCredits={openCredits}
        />
      )}

      {screen === 'cyoa' && (
        <CyoaScreen
          nodeId={state.cyoaNode}
          onChoose={cyoaChoose}
          onAdvance={cyoaAdvance}
        />
      )}

      {screen === 'chapter0' && (
        <>
          <Header onHelp={toggleHelp} chapter="Chapter 0 · The Mitchell Fever" />
          <div className="game-main">
            <PatientCard pain={state.patientPain} reliefRate={state.globalReliefRate} />

            <div className="channels-area">
              <div className="channels-header">
                <h2>Assignment Area</h2>
                <p className="relief-rate">
                  {state.globalReliefRate > 0
                    ? `${(state.globalReliefRate * 100).toFixed(0)}% of Ethan's pain is being shared`
                    : 'Assign helpers to start sharing pain'}
                </p>
              </div>
              {VECTORS.map((vector: PainVector) => (
                <PainChannelCard
                  key={vector}
                  vector={vector}
                  assignments={getAllocationForVector(vector)}
                  participants={state.participants}
                  selectedParticipantId={state.selectedParticipantId}
                  onAssign={assignToVector}
                  highlight={
                    (state.tutorialStep === 'assign_inflammatory' && vector === 'inflammatory') ||
                    (state.tutorialStep === 'assign_mike' && vector === 'systemic')
                  }
                />
              ))}
            </div>

            <div className="panel">
              <div className="panel-label">Family Roster</div>
              <div className="roster-list">
                {state.participants.map((p) => (
                  <FamilyMemberCard
                    key={p.id}
                    participant={p}
                    selected={state.selectedParticipantId === p.id}
                    allocation={getParticipantAllocation(p.id)}
                    onSelect={selectParticipant}
                    highlight={
                      (state.tutorialStep === 'select_sarah' && p.id === 'sarah') ||
                      (state.tutorialStep === 'assign_mike' && p.id === 'mike' && !state.selectedParticipantId)
                    }
                    disabled={isTutorialBlocking(p.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          <ControlBar
            tick={state.tick}
            paused={state.paused}
            speed={state.speed}
            muted={muted}
            latestLedger={latestLedger}
            onTogglePause={togglePause}
            onSetSpeed={setSpeed}
            onToggleMute={toggleMute}
            playHighlight={state.tutorialStep === 'press_play'}
          />

          <DraggableTutorial step={state.tutorialStep} selectedParticipantId={state.selectedParticipantId} />
          {state.showPathChoice && <PathChoiceModal onChoose={choosePath} />}
        </>
      )}

      {screen === 'overworld' && (
        <>
          <Overworld store={store} />
          {state.overworld.showCommandMenu && (
            <div className="command-menu-overlay">
              <div className="command-menu-header">
                <h2>Burden Command</h2>
                <button type="button" className="ow-menu-btn" onClick={closeCommandMenu}>Esc · Back to World</button>
              </div>
              <TriageDashboard
                state={state}
                onTabChange={setTriageTab}
                onSelectPatient={selectPatient}
                onOpenDrawer={openDrawer}
                onSetPriority={setPatientPriority}
                onSetFilter={setPatientFilter}
                onSetSearch={setPatientSearch}
                onSort={sortPatients}
                onTogglePause={togglePause}
                onSetSpeed={setSpeed}
                onOptimize={optimizeTriage}
                onAssignHelper={assignHelperToPatient}
                onBulkAssign={bulkAssignBest}
                onBulkEndure={bulkEndure}
                onBulkPriority={bulkSetPriority}
                onUnlockResearch={unlockResearch}
                onAlertClick={jumpToPatient}
                highlightPatientId={highlightPatientId}
                recommendedPatientId={recommendedPatientId}
              />
              <PatientDetailDrawer
                patient={drawerPatient}
                participants={state.participants}
                onClose={closeDrawer}
                onAssignHelper={assignHelperToPatient}
                onSetPriority={setPatientPriority}
              />
            </div>
          )}
          {state.showUpgradePicker && state.pendingUpgradeChoices && (
            <UpgradePicker
              cards={state.pendingUpgradeChoices}
              rank={state.directorRank}
              onPick={pickUpgrade}
            />
          )}
          {state.showLootPicker && state.pendingLootChoices && (
            <LootPicker items={state.pendingLootChoices} onPick={pickLoot} />
          )}
        </>
      )}

      {screen === 'triage' && (
        <>
          <Header onHelp={toggleHelp} chapter="Burden Command · Day " day={state.tick} />
          <TriageDashboard
            state={state}
            onTabChange={setTriageTab}
            onSelectPatient={selectPatient}
            onOpenDrawer={openDrawer}
            onSetPriority={setPatientPriority}
            onSetFilter={setPatientFilter}
            onSetSearch={setPatientSearch}
            onSort={sortPatients}
            onTogglePause={togglePause}
            onSetSpeed={setSpeed}
            onOptimize={optimizeTriage}
            onAssignHelper={assignHelperToPatient}
            onBulkAssign={bulkAssignBest}
            onBulkEndure={bulkEndure}
            onBulkPriority={bulkSetPriority}
            onUnlockResearch={unlockResearch}
            onAlertClick={jumpToPatient}
            highlightPatientId={highlightPatientId}
            recommendedPatientId={recommendedPatientId}
          />
          <PatientDetailDrawer
            patient={drawerPatient}
            participants={state.participants}
            onClose={closeDrawer}
            onAssignHelper={assignHelperToPatient}
            onSetPriority={setPatientPriority}
          />
          {state.showUpgradePicker && state.pendingUpgradeChoices && (
            <UpgradePicker
              cards={state.pendingUpgradeChoices}
              rank={state.directorRank}
              onPick={pickUpgrade}
            />
          )}
          {state.showLootPicker && state.pendingLootChoices && (
            <LootPicker items={state.pendingLootChoices} onPick={pickLoot} />
          )}
        </>
      )}

      {screen === 'result' && (
        <ResultScreen
          endReason={state.endReason}
          score={state.score}
          patientPain={state.patientPain}
          tick={state.tick}
          onRestart={restart}
        />
      )}

      {screen === 'settings' && (
        <SettingsModal
          musicVolume={state.settings.musicVolume}
          muted={state.settings.muted}
          pauseOnCritical={state.settings.pauseOnCritical}
          tickSpeedMultiplier={state.settings.tickSpeedMultiplier}
          smartDefaults={state.settings.smartDefaults}
          onSetVolume={setMusicVolume}
          onToggleMute={toggleMute}
          onSetSetting={setSetting}
          onClose={backToStart}
        />
      )}

      {screen === 'credits' && <CreditsScreen onBack={backToStart} />}

      {state.showHelp && <HelpModal onClose={toggleHelp} />}
      {state.showShortcuts && <KeyboardShortcutsPanel onClose={() => store.toggleShortcuts()} />}

      <ToastSystem toasts={state.toasts} onDismiss={dismissToast} />

      {ripple && (
        <div
          className="ripple"
          style={{ left: ripple.x, top: ripple.y }}
          key={ripple.id}
        />
      )}
    </div>
  );
}
