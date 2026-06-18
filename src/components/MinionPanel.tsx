import { MINION_TYPES, type MinionType } from '../game/minions';
import type { ParticipantState } from '../game/State';

interface Props {
  minions: ParticipantState[];
  family: ParticipantState[];
  onDeploy?: (minionId: string) => void;
}

export function MinionPanel({ minions, family }: Props) {
  const byType = (type: MinionType) =>
    minions.filter((m) => m.id.includes(`minion-${type}-`));

  return (
    <div className="minion-panel">
      <div className="minion-section glass-panel">
        <div className="panel-label">Family · Household</div>
        <div className="roster-grid">
          {family.map((p) => (
            <div key={p.id} className="roster-card">
              <span className="member-avatar" style={{ background: p.color }}>
                {p.initial}
              </span>
              <div>
                <strong>{p.name}</strong>
                <p>{p.role}</p>
                <span className="le-tag">LE {p.le.toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="minion-section glass-panel">
        <div className="panel-label">Minions · Burden Constructs</div>
        <p className="minion-hint">
          Abstract carriers with no faces — only capacity. Deploy them like tools, not people.
        </p>
        <div className="minion-type-grid">
          {(Object.keys(MINION_TYPES) as MinionType[]).map((type) => {
            const def = MINION_TYPES[type];
            const units = byType(type);
            const active = units.filter((u) => u.active && u.le > 15).length;
            return (
              <div key={type} className="minion-type-card">
                <span className="member-avatar" style={{ background: def.color }}>
                  {def.initial}
                </span>
                <h4>{def.label}</h4>
                <p>{def.role}</p>
                <span className="minion-count">{active}/{units.length} ready</span>
              </div>
            );
          })}
        </div>
        <ul className="minion-roster-list">
          {minions.map((m) => (
            <li key={m.id} className={m.le < 20 ? 'exhausted' : ''}>
              <span className="member-avatar small" style={{ background: m.color }}>
                {m.initial}
              </span>
              {m.name} · LE {m.le.toFixed(0)}%
              {m.assignedPatientId && <span className="assigned-tag">assigned</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
