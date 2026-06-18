import { STATUS_COLORS } from '../game/constants';
import type { PatientRecord } from '../game/State';

interface Props {
  queue: PatientRecord[];
  onSelect: (id: string) => void;
}

export function TriageQueue({ queue, onSelect }: Props) {
  return (
    <div className="triage-queue">
      <div className="panel-label">Triage Queue</div>
      <p className="queue-subtitle">Needs attention now</p>
      <ul className="queue-list">
        {queue.length === 0 && (
          <li className="queue-empty">All patients stable</li>
        )}
        {queue.slice(0, 12).map((p, i) => (
          <li key={p.id}>
            <button type="button" className="queue-item" onClick={() => onSelect(p.id)}>
              <span className="queue-rank">{i + 1}</span>
              <span
                className="status-dot"
                style={{ background: STATUS_COLORS[p.status] }}
              />
              <span className="queue-name">{p.name.split(' ')[0]}</span>
              <span className="queue-meta">
                {p.priority ? `P${p.priority}` : ''} {p.mortalityRisk.toFixed(0)}%
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
