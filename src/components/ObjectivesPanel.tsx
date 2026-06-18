import type { DailyObjective } from '../game/objectives';
import { completedObjectiveCount } from '../game/objectives';

interface Props {
  objectives: DailyObjective[];
}

export function ObjectivesPanel({ objectives }: Props) {
  const done = completedObjectiveCount(objectives);

  return (
    <div className="objectives-panel glass-panel">
      <div className="panel-label">Objectives ({done}/{objectives.length})</div>
      <ul className="objectives-list">
        {objectives.map((obj) => (
          <li key={obj.id} className={obj.completed ? 'completed' : ''}>
            <span className="obj-check">{obj.completed ? '☑' : '□'}</span>
            <span className="obj-label">{obj.label}</span>
            {!obj.completed && obj.id !== 'trust-70' && (
              <span className="obj-progress">{obj.progress}/{obj.target}</span>
            )}
            {obj.completed && <span className="obj-reward">+{obj.rewardRP} RP</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
