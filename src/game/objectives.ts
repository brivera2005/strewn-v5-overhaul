/** Daily objectives, streaks, and combo meter */

export interface DailyObjective {
  id: string;
  label: string;
  target: number;
  progress: number;
  completed: boolean;
  rewardRP: number;
}

export interface ComboState {
  count: number;
  multiplier: number;
  lastAssignTime: number;
}

export const COMBO_WINDOW_MS = 10000;

export function createDailyObjectives(): DailyObjective[] {
  return [
    { id: 'stabilize-3', label: 'Stabilize 3 patients', target: 3, progress: 0, completed: false, rewardRP: 30 },
    { id: 'assign-10', label: 'Assign 10 volunteers', target: 10, progress: 0, completed: false, rewardRP: 20 },
    { id: 'trust-70', label: 'Keep Trust above 70', target: 70, progress: 70, completed: false, rewardRP: 25 },
  ];
}

export function updateCombo(combo: ComboState, now: number, durationBonus = 0): ComboState {
  const window = COMBO_WINDOW_MS + durationBonus * 1000;
  if (now - combo.lastAssignTime > window) {
    return { count: 1, multiplier: 1, lastAssignTime: now };
  }
  const count = combo.count + 1;
  const multiplier = Math.min(3, 1 + count * 0.15);
  return { count, multiplier, lastAssignTime: now };
}

export function getComboMultiplier(combo: ComboState, now: number, durationBonus = 0): number {
  const window = COMBO_WINDOW_MS + durationBonus * 1000;
  if (now - combo.lastAssignTime > window) return 1;
  return combo.multiplier;
}

export function updateObjectives(
  objectives: DailyObjective[],
  event: { type: 'stabilize' } | { type: 'assign' } | { type: 'trust'; value: number },
): DailyObjective[] {
  return objectives.map((obj) => {
    if (obj.completed) return obj;
    let progress = obj.progress;
    if (event.type === 'stabilize' && obj.id === 'stabilize-3') progress += 1;
    if (event.type === 'assign' && obj.id === 'assign-10') progress += 1;
    if (event.type === 'trust' && obj.id === 'trust-70') progress = event.value;
    const completed =
      obj.id === 'trust-70' ? progress >= obj.target : progress >= obj.target;
    return { ...obj, progress, completed };
  });
}

export function completedObjectiveCount(objectives: DailyObjective[]): number {
  return objectives.filter((o) => o.completed).length;
}
