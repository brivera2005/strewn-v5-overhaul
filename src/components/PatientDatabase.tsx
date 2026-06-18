import { STATUS_COLORS } from '../game/constants';
import { getCriticalReasons, getSuggestedAction } from '../game/SimulationMulti';
import { getDiseaseIcon } from '../game/PatientGenerator';
import type { PatientFilter, PatientRecord, ParticipantState } from '../game/State';
import { Tooltip, METRIC_TOOLTIPS } from './TooltipSystem';

type SortCol = keyof PatientRecord;

interface Props {
  patients: PatientRecord[];
  participants: ParticipantState[];
  selectedIds: string[];
  filter: PatientFilter;
  search: string;
  sortColumn: SortCol | null;
  sortAsc: boolean;
  onSelectPatient: (id: string, ctrlKey: boolean) => void;
  onOpenDrawer: (id: string) => void;
  onSetPriority: (id: string, priority: 1 | 2 | 3 | null) => void;
  onSetFilter: (filter: PatientFilter) => void;
  onSetSearch: (q: string) => void;
  onSort: (col: SortCol) => void;
  onBulkAssign: () => void;
  onBulkEndure: () => void;
  onBulkPriority: (priority: 1 | 2 | 3) => void;
  highlightId?: string | null;
  recommendedId?: string | null;
}

const COLUMNS: { key: SortCol; label: string; width?: string; tip?: string }[] = [
  { key: 'id', label: 'ID', width: '90px' },
  { key: 'name', label: 'Name', width: '130px' },
  { key: 'age', label: 'Age', width: '50px' },
  { key: 'disease', label: 'Disease', width: '140px' },
  { key: 'painLoad', label: 'Pain', width: '55px', tip: METRIC_TOOLTIPS.painLoad },
  { key: 'tempF', label: 'Temp', width: '65px', tip: METRIC_TOOLTIPS.tempF },
  { key: 'stage', label: 'Stage', width: '55px' },
  { key: 'priority', label: 'Pri', width: '45px' },
  { key: 'status', label: 'Status', width: '100px' },
  { key: 'days', label: 'Days', width: '50px' },
  { key: 'assignedNetworkSize', label: 'Net', width: '45px', tip: METRIC_TOOLTIPS.network },
  { key: 'matchAvg', label: 'Match', width: '55px', tip: METRIC_TOOLTIPS.matchAvg },
  { key: 'mortalityRisk', label: 'Mort%', width: '60px', tip: METRIC_TOOLTIPS.mortalityRisk },
  { key: 'ward', label: 'Ward', width: '80px' },
];

function filterPatients(patients: PatientRecord[], filter: PatientFilter, search: string): PatientRecord[] {
  let result = patients;
  if (filter === 'critical') result = result.filter((p) => p.status === 'critical' || p.status === 'dying');
  else if (filter === 'dead') result = result.filter((p) => p.dead);
  else if (filter !== 'all') result = result.filter((p) => p.status === filter);

  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.disease.toLowerCase().includes(q) ||
        p.status.includes(q) ||
        p.ward.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q),
    );
  }
  return result;
}

function sortPatients(patients: PatientRecord[], col: SortCol | null, asc: boolean): PatientRecord[] {
  if (!col) return patients;
  return [...patients].sort((a, b) => {
    const av = a[col];
    const bv = b[col];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === 'number' && typeof bv === 'number') return asc ? av - bv : bv - av;
    return asc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  });
}

function rowClass(p: PatientRecord): string {
  if (p.dead) return 'row-dead';
  if (p.status === 'dying') return 'row-dying';
  if (p.status === 'critical') return 'row-critical';
  if (p.status === 'strained') return 'row-strained';
  if (p.status === 'stable' || p.status === 'strewn-active') return 'row-stable';
  return '';
}

function outcomeBadge(p: PatientRecord): string | null {
  if (p.dead) return 'LOST';
  if (p.status === 'stable' || p.status === 'strewn-active') return 'WIN';
  if (p.status === 'endured') return 'ENDURE';
  return null;
}

export function PatientDatabase({
  patients,
  participants,
  selectedIds,
  filter,
  search,
  sortColumn,
  sortAsc,
  onSelectPatient,
  onOpenDrawer,
  onSetPriority,
  onSetFilter,
  onSetSearch,
  onSort,
  onBulkAssign,
  onBulkEndure,
  onBulkPriority,
  highlightId,
  recommendedId,
}: Props) {
  const filtered = sortPatients(filterPatients(patients, filter, search), sortColumn, sortAsc);
  const availableHelpers = participants.filter((p) => p.active && p.le > 15 && !p.assignedPatientId).length;
  const hasSelection = selectedIds.length > 0;

  const filters: { id: PatientFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'critical', label: 'Critical' },
    { id: 'stable', label: 'Stable' },
    { id: 'dying', label: 'Dying' },
    { id: 'dead', label: 'Dead' },
    { id: 'strewn-active', label: 'Strewn' },
  ];

  return (
    <div className="patient-database">
      <div className="db-toolbar">
        <span className="panel-label">Patient Database</span>
        <input
          type="search"
          className="db-search"
          placeholder="Search name, disease, status..."
          value={search}
          onChange={(e) => onSetSearch(e.target.value)}
          aria-label="Search patients"
        />
        <div className="db-filters">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`filter-chip ${filter === f.id ? 'active' : ''}`}
              onClick={() => onSetFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {hasSelection && (
        <div className="bulk-actions">
          <span>{selectedIds.length} selected</span>
          <button type="button" className="btn-secondary small" onClick={onBulkAssign}>
            Assign Best Available
          </button>
          <button type="button" className="btn-secondary small" onClick={onBulkEndure}>
            Mark Endure
          </button>
          <button type="button" className="btn-secondary small" onClick={() => onBulkPriority(1)}>
            Set P1 Priority
          </button>
        </div>
      )}

      <div className="db-table-wrap">
        <table className="db-table sticky-header">
          <thead>
            <tr>
              {COLUMNS.map((col) => {
                const th = (
                  <th
                    key={col.key}
                    style={{ minWidth: col.width }}
                    onClick={() => onSort(col.key)}
                    className="sortable"
                  >
                    {col.label}
                    {sortColumn === col.key && (sortAsc ? ' ▲' : ' ▼')}
                  </th>
                );
                return col.tip ? <Tooltip key={col.key} content={col.tip}>{th}</Tooltip> : th;
              })}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const badge = outcomeBadge(p);
              const suggestion = getSuggestedAction(p, availableHelpers);
              const reasons = (p.status === 'critical' || p.status === 'dying')
                ? getCriticalReasons(p, availableHelpers).join(' · ')
                : '';

              return (
                <tr
                  key={p.id}
                  id={`patient-row-${p.id}`}
                  className={`${rowClass(p)} ${selectedIds.includes(p.id) ? 'selected' : ''} ${highlightId === p.id ? 'highlighted' : ''} ${recommendedId === p.id ? 'recommended-pulse' : ''}`}
                  onClick={(e) => {
                    onSelectPatient(p.id, e.ctrlKey || e.metaKey);
                    onOpenDrawer(p.id);
                  }}
                >
                  <td>{p.id}</td>
                  <td>
                    <span className="disease-icon-sm">{p.icon ?? getDiseaseIcon(p.disease)}</span>
                    {p.name}
                    {badge && <span className={`outcome-badge badge-${badge.toLowerCase()}`}>{badge}</span>}
                  </td>
                  <td>{p.age}</td>
                  <td>{p.disease}</td>
                  <td>
                    <div className="cell-bar-wrap">
                      <div className="cell-bar pain" style={{ width: `${p.dead ? 0 : p.painLoad}%` }} />
                      <span>{p.dead ? '-' : p.painLoad.toFixed(0)}</span>
                    </div>
                  </td>
                  <td>{p.dead ? '-' : `${p.tempF.toFixed(1)}°`}</td>
                  <td>{p.stage}</td>
                  <td>
                    {!p.dead && (
                      <select
                        value={p.priority ?? ''}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const v = e.target.value;
                          onSetPriority(p.id, v ? (Number(v) as 1 | 2 | 3) : null);
                        }}
                        className="priority-select"
                      >
                        <option value="">-</option>
                        <option value="1">P1</option>
                        <option value="2">P2</option>
                        <option value="3">P3</option>
                      </select>
                    )}
                  </td>
                  <td>
                    <Tooltip content={reasons || `Status: ${p.status}`}>
                      <span>
                        <span className="status-dot" style={{ background: STATUS_COLORS[p.status] ?? '#666' }} />
                        {p.status}
                      </span>
                    </Tooltip>
                  </td>
                  <td>{p.days}</td>
                  <td>{p.assignedNetworkSize}</td>
                  <td>{p.matchAvg > 0 ? `${p.matchAvg.toFixed(0)}%` : '-'}</td>
                  <td>{p.dead ? '-' : `${p.mortalityRisk.toFixed(0)}%`}</td>
                  <td>{p.ward}</td>
                  <td>
                    {suggestion && !p.dead && (
                      <span className="suggested-chip sm">{suggestion}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
