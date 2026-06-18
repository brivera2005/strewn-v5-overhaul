import { AnimatedNumber } from './AnimatedNumber';
import { ObjectivesPanel } from './ObjectivesPanel';
import { StatsPanel } from './StatsPanel';
import { Tooltip, METRIC_TOOLTIPS } from './TooltipSystem';
import {
  buildTriageQueue,
  forecastDeaths,
  getNetworkCapacity,
  getTriageAlerts,
} from '../game/SimulationMulti';
import type { GameAlert, GameState } from '../game/State';

interface Props {
  state: GameState;
  onSelectPatient: (id: string) => void;
  onAlertClick: (patientId?: string) => void;
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <svg className="sparkline" viewBox="0 0 60 20" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        points={values.map((v, i) => `${(i / (values.length - 1)) * 60},${20 - (v / max) * 18}`).join(' ')}
      />
    </svg>
  );
}

export function CommandCenter({ state, onSelectPatient, onAlertClick }: Props) {
  const alerts = getTriageAlerts(state);
  const queue = buildTriageQueue(state.patients).slice(0, 5);
  const network = getNetworkCapacity(state);
  const forecast = forecastDeaths(state, 10);
  const active = state.patients.filter((p) => !p.dead).length;
  const critical = state.patients.filter((p) => !p.dead && (p.status === 'critical' || p.status === 'dying')).length;
  const stable = state.patients.filter((p) => p.status === 'stable' || p.status === 'strewn-active').length;
  const aplVac = active / Math.max(1, network.total - network.allocated);

  const recentAlerts: GameAlert[] = state.alerts.slice(0, 8);
  const painHistory = state.patients
    .filter((p) => !p.dead)
    .map((p) => p.painLoad)
    .slice(0, 12);

  const familyCount = state.participants.filter((p) => !p.id.startsWith('minion-')).length;
  const minionCount = state.participants.filter((p) => p.id.startsWith('minion-')).length;

  const metrics = [
    { label: 'Active patients', value: active, tip: 'Total living patients in your ward' },
    { label: 'Critical', value: critical, tip: 'Patients needing immediate assignment' },
    { label: 'Stable', value: stable, tip: 'Patients with manageable pain load' },
    { label: 'Deaths today', value: state.triageStats.deaths, tip: 'Total deaths this session' },
    { label: 'DALYs saved', value: state.triageStats.dalysSaved, tip: 'Disability-adjusted life years preserved' },
    { label: 'Stabilized', value: state.triageStats.stabilized, tip: 'Patients brought to stable status' },
    { label: 'Family', value: familyCount, tip: 'Household carriers in network' },
    { label: 'Minions', value: minionCount, tip: 'Deployed burden constructs' },
    { label: 'Relics', value: state.inventory.length, tip: 'Loot items collected' },
    { label: 'Trust', value: state.currencies.trust, tip: METRIC_TOOLTIPS.trust },
    { label: 'Rank', value: state.directorRank, tip: METRIC_TOOLTIPS.rank },
    { label: 'Streak', value: state.streakTicks, tip: METRIC_TOOLTIPS.streak },
    { label: 'Memorial', value: state.triageStats.memorialCount, tip: 'Patients lost to memorial' },
    { label: 'Avg pain', value: Math.round(painHistory.reduce((a, b) => a + b, 0) / Math.max(1, painHistory.length)), tip: 'Average pain load across active patients' },
    { label: 'Research', value: state.researchUnlocked.length, tip: 'Research nodes unlocked' },
    { label: 'Upgrades', value: state.ownedUpgrades.length, tip: 'Director rank upgrades owned' },
    { label: 'Tick', value: state.tick, tip: 'Current simulation day' },
    { label: 'RP balance', value: state.currencies.reliefPoints, tip: METRIC_TOOLTIPS.reliefPoints },
  ];

  return (
    <div className="command-center">
      <div className="command-grid">
        <div className="command-metrics glass-panel">
          <div className="panel-label">Live Metrics</div>
          <div className="metrics-grid">
            {metrics.map((m) => (
              <Tooltip key={m.label} content={m.tip}>
                <div className="metric-card">
                  <span className="metric-label">{m.label}</span>
                  <AnimatedNumber value={m.value} className="metric-value" />
                  <Sparkline values={[m.value * 0.8, m.value * 0.9, m.value, m.value * 1.05, m.value]} />
                </div>
              </Tooltip>
            ))}
          </div>

          <div className="gauge-row">
            <Tooltip content={METRIC_TOOLTIPS.aplVac}>
              <div className="gauge-widget">
                <label>APL/VAC</label>
                <div className="gauge-bar">
                  <div className="gauge-fill" style={{ width: `${Math.min(100, aplVac * 50)}%` }} />
                </div>
                <span>{aplVac.toFixed(2)}</span>
              </div>
            </Tooltip>
            <Tooltip content={METRIC_TOOLTIPS.trust}>
              <div className="gauge-widget">
                <label>Trust</label>
                <div className="gauge-bar trust">
                  <div className="gauge-fill" style={{ width: `${state.currencies.trust}%` }} />
                </div>
                <span>{state.currencies.trust.toFixed(0)}%</span>
              </div>
            </Tooltip>
            <Tooltip content="Carriers allocated vs available capacity">
              <div className="gauge-widget">
                <label>Network {network.allocated}/{network.total}</label>
                <div className="gauge-bar network">
                  <div
                    className="gauge-fill"
                    style={{ width: `${network.total ? (network.allocated / network.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </Tooltip>
          </div>

          <Tooltip content={METRIC_TOOLTIPS.forecast}>
            <div className="forecast-panel">
              At current rate, <strong>{forecast}</strong> death(s) in next 10 ticks
            </div>
          </Tooltip>
        </div>

        <div className="command-alerts glass-panel">
          <div className="panel-label">Alerts Feed</div>
          <div className="alerts-feed">
            {recentAlerts.length === 0 && (
              <p className="alerts-empty">No alerts yet. Keep the network running.</p>
            )}
            {recentAlerts.map((a) => (
              <button
                key={a.id}
                type="button"
                className={`alert-item severity-${a.severity}`}
                onClick={() => onAlertClick(a.patientId)}
              >
                <span className="alert-tick">D{a.tick}</span>
                {a.message}
              </button>
            ))}
            {alerts.critical > 0 && (
              <button type="button" className="alert-item severity-critical" onClick={() => onAlertClick()}>
                {alerts.critical} patient(s) in critical state
              </button>
            )}
          </div>
        </div>

        <ObjectivesPanel objectives={state.objectives} />
      </div>

      <div className="command-bottom">
        <StatsPanel stats={state.playerStats} directorRank={state.directorRank} dalysSaved={state.dalysSaved} />
        <div className="triage-queue-panel glass-panel">
          <div className="panel-label">Triage Queue · Top 5</div>
          <ul className="queue-list">
            {queue.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => onSelectPatient(p.id)}>
                  <span className="queue-name">{p.name}</span>
                  <span className="queue-ward">{p.ward}</span>
                  <span className="queue-risk">{p.mortalityRisk.toFixed(0)}% mort</span>
                  <span className="queue-pain">{p.painLoad.toFixed(0)}% pain</span>
                </button>
              </li>
            ))}
            {queue.length === 0 && <li className="queue-empty">All patients stable</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
