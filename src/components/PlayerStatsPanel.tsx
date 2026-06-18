import { computeEffectiveStats } from '../game/gameState';
import type { GameState } from '../game/State';
import { LOOT_TABLE } from '../game/loot';

interface Props {
  state: GameState;
}

export function PlayerStatsPanel({ state }: Props) {
  const stats = computeEffectiveStats(state);
  const items = state.inventory
    .map((o) => LOOT_TABLE.find((l) => l.id === o.id))
    .filter(Boolean);

  return (
    <div className="player-stats-panel glass-panel">
      <div className="panel-label">Your Stats</div>
      <div className="stats-grid">
        <div className="stat-row">
          <span>Resilience</span>
          <strong>{stats.resilience}</strong>
        </div>
        <div className="stat-row">
          <span>Insight</span>
          <strong>{stats.insight}</strong>
        </div>
        <div className="stat-row">
          <span>Burden Cap</span>
          <strong>{stats.burdenCapacity}</strong>
        </div>
        <div className="stat-row">
          <span>Relief Power</span>
          <strong>{(stats.reliefPower * 100).toFixed(0)}%</strong>
        </div>
        <div className="stat-row">
          <span>Combo Yield</span>
          <strong>{(stats.comboYield * 100).toFixed(0)}%</strong>
        </div>
        <div className="stat-row">
          <span>Minion Slots</span>
          <strong>+{stats.minionSlots}</strong>
        </div>
      </div>
      {items.length > 0 && (
        <>
          <div className="panel-label" style={{ marginTop: '1rem' }}>Relics ({items.length})</div>
          <ul className="relic-list">
            {items.map((item) => item && (
              <li key={item.id} className="relic-item">
                <span>{item.name}</span>
                <span className="relic-rarity">{item.rarity}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
