import type { ArenaState } from '../../game/arena/types';
import { CHARM_DEFS } from '../../game/arena/charms';

interface Props {
  arenaRef: React.RefObject<ArenaState | null>;
  tick: number;
}

export function GameHUD({ arenaRef, tick }: Props) {
  const state = arenaRef.current;
  if (!state) return null;
  void tick;

  return (
    <div className="game-hud">
      {state.altarActive && (
        <div className="hud-banner altar-banner">
          MELD ALTAR · Press 1 and 2 to slot charms · E to fuse
        </div>
      )}
      <div className="hud-meld-slots">
        <span className={state.meldSlots[0] ? 'slot filled' : 'slot'}>
          1: {state.meldSlots[0] ? CHARM_DEFS[state.meldSlots[0]].name : 'empty'}
        </span>
        <span className={state.meldSlots[1] ? 'slot filled' : 'slot'}>
          2: {state.meldSlots[1] ? CHARM_DEFS[state.meldSlots[1]].name : 'empty'}
        </span>
      </div>
      <div className="hud-hint">SPACE · deploy minion ({state.minions.length} active)</div>
    </div>
  );
}
