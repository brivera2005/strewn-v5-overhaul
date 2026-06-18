import type { PlayerStats } from '../game/State';

interface Props {
  stats: PlayerStats;
  directorRank: number;
  dalysSaved: number;
}

const STAT_LABELS: { key: keyof PlayerStats; label: string; tip: string; format?: (v: number) => string }[] = [
  { key: 'resilience', label: 'Resilience', tip: 'Reduces Life Energy drain on helpers' },
  { key: 'insight', label: 'Insight', tip: 'Improves match quality on assignments' },
  { key: 'burdenCapacity', label: 'Burden Capacity', tip: 'How much pain your network can carry' },
  {
    key: 'reliefPower',
    label: 'Relief Power',
    tip: 'Bonus relief transfer efficiency',
    format: (v) => `+${(v * 100).toFixed(0)}%`,
  },
  {
    key: 'comboYield',
    label: 'Combo Yield',
    tip: 'Extra rewards from assignment streaks',
    format: (v) => `+${(v * 100).toFixed(0)}%`,
  },
  { key: 'minionSlots', label: 'Minion Slots', tip: 'Deployable Shade Units and drones' },
];

export function StatsPanel({ stats, directorRank, dalysSaved }: Props) {
  return (
    <div className="stats-panel glass-panel">
      <div className="panel-label">Director Stats</div>
      <div className="stats-rank-row">
        <span>Rank {directorRank}</span>
        <span>{dalysSaved.toFixed(0)} DALYs saved</span>
      </div>
      <div className="stats-grid">
        {STAT_LABELS.map(({ key, label, tip, format }) => {
          const raw = stats[key];
          const display = format ? format(raw) : raw.toFixed(0);
          return (
            <div key={key} className="stat-row" title={tip}>
              <span className="stat-label">{label}</span>
              <div className="stat-bar-wrap">
                <div
                  className="stat-bar-fill"
                  style={{
                    width: `${Math.min(100, key === 'reliefPower' || key === 'comboYield' ? raw * 500 : raw)}%`,
                  }}
                />
              </div>
              <span className="stat-value">{display}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
