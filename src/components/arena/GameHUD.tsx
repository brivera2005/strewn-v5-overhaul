import type { ArenaState } from '../../game/arena/types';
import { CHARM_DEFS } from '../../game/arena/charms';
import { PAIN_NAMES } from '../../game/strewn/ecology';

interface Props {
  arenaRef: React.RefObject<ArenaState | null>;
  tick: number;
}

export function GameHUD({ arenaRef, tick }: Props) {
  const state = arenaRef.current;
  if (!state) return null;
  void tick;

  const pain = state.burden.pain;
  const dominant = (['grief', 'rage', 'dread', 'hollow'] as const).reduce((a, b) =>
    pain[a] >= pain[b] ? a : b,
  );
  const burdenHigh = state.burden.current / state.burden.max > 0.7;

  return (
    <div className={`game-hud ${burdenHigh ? 'burden-critical' : ''}`}>
      {state.shrineActive && (
        <div className="hud-banner altar-banner" title="Slot relics with 1/2, fuse with E">
          MELD SHRINE · 1/2 slot · E fuse
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
        <span className="hud-hint" title="Place a sink node at cursor">Q · sink ({state.sinks.length}/{state.maxSinks})</span>
        <span className="hud-hint" title="Vent burden shockwave">RMB · vent</span>
        <span className="hud-hint" title="Open Strewn Codex">C · codex</span>
        <span className="hud-pain" title="Dominant pain type in your pool">
          {PAIN_NAMES[dominant]}
        </span>
      </div>
    </div>
  );
}
