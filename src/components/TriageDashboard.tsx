import { PatientDatabase } from './PatientDatabase';
import { TriageQueue } from './TriageQueue';
import { CommandCenter } from './CommandCenter';
import { ResearchTree } from './ResearchTree';
import { CurrencyHUD } from './CurrencyHUD';
import { MinionPanel } from './MinionPanel';
import { InventoryPanel } from './LootPicker';
import { StatsPanel } from './StatsPanel';
import { getNetworkCapacity, buildTriageQueue, getTriageAlerts } from '../game/SimulationMulti';
import { getComboMultiplier } from '../game/objectives';
import type { GameState, TriageTab } from '../game/State';
import type { PainVector } from '../game/constants';

interface Props {
  state: GameState;
  onTabChange: (tab: TriageTab) => void;
  onSelectPatient: (id: string, ctrlKey: boolean) => void;
  onOpenDrawer: (id: string) => void;
  onSetPriority: (id: string, priority: 1 | 2 | 3 | null) => void;
  onSetFilter: (filter: GameState['patientFilter']) => void;
  onSetSearch: (q: string) => void;
  onSort: (col: keyof GameState['patients'][0]) => void;
  onTogglePause: () => void;
  onSetSpeed: (speed: 1 | 2 | 3) => void;
  onOptimize: () => void;
  onAssignHelper: (patientId: string, helperId: string, vector: PainVector) => void;
  onBulkAssign: () => void;
  onBulkEndure: () => void;
  onBulkPriority: (priority: 1 | 2 | 3) => void;
  onUnlockResearch: (nodeId: string) => void;
  onAlertClick: (patientId?: string) => void;
  highlightPatientId?: string | null;
  recommendedPatientId?: string | null;
}

const TABS: { id: TriageTab; label: string }[] = [
  { id: 'command', label: 'Command' },
  { id: 'database', label: 'Patients' },
  { id: 'minions', label: 'Family & Minions' },
  { id: 'inventory', label: 'Loot' },
  { id: 'research', label: 'Research' },
];

export function TriageDashboard({
  state,
  onTabChange,
  onSelectPatient,
  onOpenDrawer,
  onSetPriority,
  onSetFilter,
  onSetSearch,
  onSort,
  onTogglePause,
  onSetSpeed,
  onOptimize,
  onAssignHelper,
  onBulkAssign,
  onBulkEndure,
  onBulkPriority,
  onUnlockResearch,
  onAlertClick,
  highlightPatientId,
  recommendedPatientId,
}: Props) {
  const alerts = getTriageAlerts(state);
  const queue = buildTriageQueue(state.patients);
  const selectedPatients = state.patients.filter((p) => state.selectedPatientIds.includes(p.id));
  const availableHelpers = state.participants.filter((p) => p.active && p.le > 15);
  const network = getNetworkCapacity(state);
  const comboMult = getComboMultiplier(state.combo, Date.now(), state.activeUpgrades.comboDurationBonus);

  const family = state.participants.filter((p) => !p.id.startsWith('minion-'));
  const minions = state.participants.filter((p) => p.id.startsWith('minion-'));

  const dbProps = {
    patients: state.patients,
    participants: state.participants,
    selectedIds: state.selectedPatientIds,
    filter: state.patientFilter,
    search: state.patientSearch,
    sortColumn: state.sortColumn,
    sortAsc: state.sortAsc,
    onSelectPatient,
    onOpenDrawer,
    onSetPriority,
    onSetFilter,
    onSetSearch,
    onSort,
    onBulkAssign,
    onBulkEndure,
    onBulkPriority,
    highlightId: highlightPatientId,
    recommendedId: recommendedPatientId,
  };

  return (
    <div className="triage-dashboard tab-transition">
      <CurrencyHUD
        currencies={state.currencies}
        directorRank={state.directorRank}
        dalysSaved={state.dalysSaved}
        researchUnlocked={state.researchUnlocked}
        streakTicks={state.streakTicks}
        comboMultiplier={comboMult}
      />

      <div className="triage-header">
        <div className="triage-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`triage-tab ${state.triageTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="network-capacity-bar">
          Network: {network.allocated}/{network.total} carriers allocated
          <div className="capacity-fill" style={{ width: `${network.total ? (network.allocated / network.total) * 100 : 0}%` }} />
        </div>
        <div className="triage-controls">
          <span className="day-counter">Day <strong>{state.tick}</strong></span>
          <button type="button" className="btn-play small" onClick={onTogglePause}>
            {state.paused ? '▶' : '⏸'}
          </button>
          {([1, 2, 3] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`speed-btn ${state.speed === s ? 'active' : ''}`}
              onClick={() => onSetSpeed(s)}
            >
              {s}×
            </button>
          ))}
          <button type="button" className="btn-secondary small" onClick={onOptimize}>
            Optimize Critical First
          </button>
        </div>
      </div>

      <div className="triage-main">
        {state.triageTab === 'command' && (
          <CommandCenter state={state} onSelectPatient={(id) => onSelectPatient(id, false)} onAlertClick={onAlertClick} />
        )}

        {state.triageTab === 'database' && (
          <div className="triage-split">
            <PatientDatabase {...dbProps} />
            <div className="triage-right">
              <TriageQueue queue={queue} onSelect={(id) => { onSelectPatient(id, false); onOpenDrawer(id); }} />
              <StatsPanel stats={state.playerStats} directorRank={state.directorRank} dalysSaved={state.dalysSaved} />
            </div>
          </div>
        )}

        {state.triageTab === 'minions' && (
          <div className="triage-split">
            <PatientDatabase {...dbProps} />
            <div className="triage-right">
              <MinionPanel minions={minions} family={family} />
              <div className="network-assign-panel glass-panel">
                <div className="panel-label">Quick Assign</div>
                {selectedPatients.length === 0 ? (
                  <p className="network-hint">Select patient row(s) to assign carriers</p>
                ) : (
                  <>
                    <p className="network-selected">{selectedPatients.length} patient(s) selected</p>
                    <div className="helper-list">
                      {availableHelpers.map((h) => (
                        <button
                          key={h.id}
                          type="button"
                          className="helper-assign-btn"
                          onClick={() => {
                            for (const p of selectedPatients) {
                              onAssignHelper(p.id, h.id, p.painLoad > 55 ? 'inflammatory' : 'systemic');
                            }
                          }}
                        >
                          <span className="member-avatar" style={{ background: h.color, width: 32, height: 32, fontSize: '0.75rem' }}>
                            {h.initial}
                          </span>
                          {h.name.split(' ')[0]} · LE {h.le.toFixed(0)}%
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {state.triageTab === 'inventory' && (
          <div className="triage-split">
            <InventoryPanel inventory={state.inventory} />
            <StatsPanel stats={state.playerStats} directorRank={state.directorRank} dalysSaved={state.dalysSaved} />
          </div>
        )}

        {state.triageTab === 'research' && (
          <ResearchTree
            unlocked={state.researchUnlocked}
            researchPoints={state.currencies.researchPoints}
            onUnlock={onUnlockResearch}
          />
        )}
      </div>

      <div className="triage-footer">
        <div className="alert-bar">
          ALERTS: {alerts.critical} critical | {alerts.deaths} recent death(s) | Draft threshold {alerts.draftThreshold}%
        </div>
        <div className="ledger-bar">
          LEDGER: +{state.triageStats.dalysSaved.toFixed(0)} DALYs | -{state.triageStats.deaths} deaths | {state.triageStats.stabilized} stabilized | Memorial: {state.triageStats.memorialCount}
        </div>
      </div>

      {state.showDeathVignette && <div className="death-vignette" />}
      {state.reliefFlash && <div className="relief-flash" key={state.reliefFlash} />}
    </div>
  );
}
