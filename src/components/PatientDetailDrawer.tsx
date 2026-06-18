import { STATUS_COLORS, VECTOR_LABELS } from '../game/constants';
import { getCriticalReasons, getSuggestedAction } from '../game/SimulationMulti';
import { getDiseaseIcon } from '../game/PatientGenerator';
import type { PatientRecord, ParticipantState } from '../game/State';
import type { PainVector } from '../game/constants';
import { Tooltip, METRIC_TOOLTIPS } from './TooltipSystem';

interface Props {
  patient: PatientRecord | null;
  participants: ParticipantState[];
  onClose: () => void;
  onAssignHelper: (patientId: string, helperId: string, vector: PainVector) => void;
  onSetPriority: (id: string, priority: 1 | 2 | 3 | null) => void;
}

export function PatientDetailDrawer({
  patient,
  participants,
  onClose,
  onAssignHelper,
  onSetPriority,
}: Props) {
  if (!patient) return null;

  const available = participants.filter((p) => p.active && p.le > 15 && !p.assignedPatientId);
  const reasons = getCriticalReasons(patient, available.length);
  const suggestion = getSuggestedAction(patient, available.length);

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="patient-drawer glass-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="drawer-close" onClick={onClose}>×</button>
        <div className="drawer-header">
          <span className="disease-icon">{patient.icon ?? getDiseaseIcon(patient.disease)}</span>
          <div>
            <h2>{patient.name}</h2>
            <p>{patient.disease} · {patient.ward} · Age {patient.age}</p>
          </div>
          <span
            className="status-badge"
            style={{ background: STATUS_COLORS[patient.status] }}
          >
            {patient.status}
          </span>
        </div>

        <div className="drawer-stats">
          <Tooltip content={METRIC_TOOLTIPS.painLoad}>
            <div className="stat-block">
              <label>Pain</label>
              <div className="stat-bar-wrap">
                <div className="stat-bar pain" style={{ width: `${patient.painLoad}%` }} />
              </div>
              <span>{patient.painLoad.toFixed(0)}%</span>
            </div>
          </Tooltip>
          <Tooltip content={METRIC_TOOLTIPS.tempF}>
            <div className="stat-block">
              <label>Temp</label>
              <span>{patient.tempF.toFixed(1)}°F</span>
            </div>
          </Tooltip>
          <Tooltip content={METRIC_TOOLTIPS.mortalityRisk}>
            <div className="stat-block">
              <label>Mortality</label>
              <div className="stat-bar-wrap">
                <div className="stat-bar mort" style={{ width: `${patient.mortalityRisk}%` }} />
              </div>
              <span>{patient.mortalityRisk.toFixed(0)}%</span>
            </div>
          </Tooltip>
          <Tooltip content={METRIC_TOOLTIPS.matchAvg}>
            <div className="stat-block">
              <label>Match</label>
              <span>{patient.matchAvg > 0 ? `${patient.matchAvg.toFixed(0)}%` : '-'}</span>
            </div>
          </Tooltip>
        </div>

        {(patient.status === 'critical' || patient.status === 'dying') && reasons.length > 0 && (
          <div className="critical-explainer">
            <h4>Why is this patient dying?</h4>
            <ul>
              {reasons.map((r) => <li key={r}>{r}</li>)}
            </ul>
            {suggestion && <span className="suggested-chip">{suggestion}</span>}
          </div>
        )}

        {!patient.dead && (
          <>
            <div className="drawer-priority">
              <label>Priority</label>
              <select
                value={patient.priority ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  onSetPriority(patient.id, v ? (Number(v) as 1 | 2 | 3) : null);
                }}
              >
                <option value="">None</option>
                <option value="1">P1 Critical</option>
                <option value="2">P2 Urgent</option>
                <option value="3">P3 Standard</option>
              </select>
            </div>

            <div className="drawer-assign">
              <h4>Assign Volunteer</h4>
              <div className="helper-list">
                {available.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    className="helper-assign-btn"
                    onClick={() => onAssignHelper(
                      patient.id,
                      h.id,
                      patient.painLoad > 55 ? 'inflammatory' : 'systemic',
                    )}
                  >
                    <span className="member-avatar" style={{ background: h.color }}>
                      {h.initial}
                    </span>
                    {h.name.split(' ')[0]} · LE {h.le.toFixed(0)}%
                  </button>
                ))}
                {available.length === 0 && <p className="network-hint">No available volunteers</p>}
              </div>
            </div>

            {patient.allocations.length > 0 && (
              <div className="drawer-current">
                <h4>Current Assignments</h4>
                {patient.allocations.map((a) => {
                  const helper = participants.find((p) => p.id === a.participantId);
                  return (
                    <div key={a.participantId} className="alloc-row">
                      {helper?.name} → {VECTOR_LABELS[a.vector]}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
