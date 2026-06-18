import {
  VECTOR_DESCRIPTIONS,
  VECTOR_LABELS,
  matchLabel,
  type PainVector,
} from '../game/constants';
import type { Allocation, ParticipantState } from '../game/State';
import { getMatchScoreFor } from '../game/Simulation';

interface Props {
  vector: PainVector;
  assignments: Allocation[];
  participants: ParticipantState[];
  selectedParticipantId: string | null;
  onAssign: (vector: PainVector, e: React.MouseEvent) => void;
  highlight?: boolean;
}

function InflammatoryIcon() {
  return (
    <svg className="channel-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2C12 2 8 10 8 14a4 4 0 008 0c0-4-4-12-4-12z"
        fill="currentColor"
        opacity="0.9"
      />
      <path d="M12 18v4M9 20h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SystemicIcon() {
  return (
    <svg className="channel-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="8" y="2" width="8" height="16" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="12" cy="20" r="2" fill="currentColor" />
      <line x1="12" y1="6" x2="12" y2="14" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function matchClass(score: number): string {
  if (score >= 80) return 'match-excellent';
  if (score >= 70) return 'match-good';
  if (score >= 60) return 'match-fair';
  return 'match-poor';
}

export function PainChannelCard({
  vector,
  assignments,
  participants,
  selectedParticipantId,
  onAssign,
  highlight,
}: Props) {
  const assigned = assignments
    .map((a) => participants.find((p) => p.id === a.participantId))
    .filter(Boolean) as ParticipantState[];

  const canAssign = !!selectedParticipantId;
  const selectedMatch = selectedParticipantId
    ? getMatchScoreFor(selectedParticipantId, vector)
    : null;

  return (
    <button
      type="button"
      className={`channel-card ${vector} ${canAssign ? 'selected-target' : ''} ${assigned.length ? 'has-assignment' : ''} ${highlight ? 'highlight-pulse' : ''}`}
      data-tutorial={`channel-${vector}`}
      onClick={(e) => onAssign(vector, e)}
      disabled={!canAssign}
      aria-label={`Assign to ${VECTOR_LABELS[vector]} channel`}
    >
      <div className="channel-header">
        {vector === 'inflammatory' ? <InflammatoryIcon /> : <SystemicIcon />}
        <span className="channel-name">{VECTOR_LABELS[vector]} Pain</span>
      </div>
      <p className="channel-desc">{VECTOR_DESCRIPTIONS[vector]}</p>

      {assigned.length > 0 ? (
        <div className="channel-assigned">
          {assigned.map((p) => {
            const score = getMatchScoreFor(p.id, vector);
            return (
              <div key={p.id} className="assigned-chip">
                <span className="chip-avatar" style={{ background: p.color }}>
                  {p.initial}
                </span>
                {p.name.split(' ')[0]} · {score}% match
              </div>
            );
          })}
        </div>
      ) : (
        <p className="channel-empty">
          {canAssign ? 'Click here to assign selected helper' : 'Select a family member first'}
        </p>
      )}

      {canAssign && selectedMatch !== null && (
        <span className={`match-badge ${matchClass(selectedMatch)}`}>
          Match Quality: {selectedMatch}% · {matchLabel(selectedMatch)}
        </span>
      )}
    </button>
  );
}
