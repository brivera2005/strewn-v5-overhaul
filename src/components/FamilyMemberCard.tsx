import { VECTOR_LABELS, leColor } from '../game/constants';
import type { Allocation, ParticipantState } from '../game/State';

interface Props {
  participant: ParticipantState;
  selected: boolean;
  allocation?: Allocation;
  onSelect: (id: string, e: React.MouseEvent) => void;
  highlight?: boolean;
  disabled?: boolean;
}

export function FamilyMemberCard({
  participant,
  selected,
  allocation,
  onSelect,
  highlight,
  disabled,
}: Props) {
  return (
    <button
      type="button"
      className={`member-card ${selected ? 'selected' : ''} ${allocation ? 'assigned' : ''} ${highlight ? 'highlight-pulse' : ''} ${disabled ? 'disabled' : ''}`}
      data-tutorial={`member-${participant.id}`}
      data-member-id={participant.id}
      onClick={(e) => onSelect(participant.id, e)}
      aria-pressed={selected}
      aria-label={`Select ${participant.name}`}
    >
      <div className="member-row">
        <div className="member-avatar" style={{ background: participant.color }}>
          {participant.initial}
        </div>
        <div className="member-info">
          <div className="member-name">{participant.name}</div>
          <div className="member-role">{participant.role}</div>
          {allocation && (
            <div className="member-assignment">
              Assigned to {VECTOR_LABELS[allocation.vector]}
            </div>
          )}
        </div>
      </div>
      <div className="energy-bar">
        <div className="energy-label">
          <span>Life Energy</span>
          <span>{participant.le.toFixed(0)}%</span>
        </div>
        <div className="energy-track">
          <div
            className="energy-fill"
            style={{ width: `${participant.le}%`, background: leColor(participant.le) }}
          />
        </div>
      </div>
    </button>
  );
}
