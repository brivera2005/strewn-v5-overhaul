import type { ArenaState } from '../../game/arena/types';
import { CHARM_DEFS } from '../../game/arena/charms';
import { PAIN_NAMES } from '../../game/burden/ecology';

interface Props {
  arenaRef: React.RefObject<ArenaState | null>;
  tick: number;
  buildDef?: { name: string; desc: string; cost: number; key: string };
}

export function GameHUD({ arenaRef, tick, buildDef }: Props) {
  const state = arenaRef.current;
  if (!state) return null;
  void tick;

  const pain = state.burden.pain;
  const dominant = (['grief', 'rage', 'dread', 'hollow'] as const).reduce((a, b) =>
    pain[a] >= pain[b] ? a : b,
  );

  return (
    <div className="game-hud">
      {state.altarActive && (
        <div className="hud-banner altar-banner" title="Slot charms with 1/2, fuse with E">
          MELD ALTAR · 1/2 slot · E fuse
        </div>
      )}
      {state.buildMode && buildDef && (
        <div className="hud-banner build-banner" title={buildDef.desc}>
          BUILD: {buildDef.name} ({buildDef.cost} burden) · TAB cycle · F place
        </div>
      )}
      <div className="hud-meld-slots">
        <span className={state.meldSlots[0] ? 'slot filled' : 'slot'} title="Meld slot 1">
          1: {state.meldSlots[0] ? CHARM_DEFS[state.meldSlots[0]].name : '—'}
        </span>
        <span className={state.meldSlots[1] ? 'slot filled' : 'slot'} title="Meld slot 2">
          2: {state.meldSlots[1] ? CHARM_DEFS[state.meldSlots[1]].name : '—'}
        </span>
      </div>
      <div className="hud-row">
        <span className="hud-hint" title="Deploy a burden sink minion">SPACE · minion ({state.minions.length})</span>
        <span className="hud-hint" title="Open Burden Codex">C · codex</span>
        <span className="hud-hint" title="Toggle build mode">B · build</span>
        <span className="hud-pain" title="Dominant pain type in your pool">
          {PAIN_NAMES[dominant]}
        </span>
      </div>
    </div>
  );
}
