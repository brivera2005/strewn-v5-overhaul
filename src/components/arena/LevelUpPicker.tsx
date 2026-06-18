import { CHARM_DEFS } from '../../game/arena/charms';
import type { CharmId } from '../../game/arena/types';
import { musicEngine } from '../../game/MusicEngine';

interface Props {
  choices: CharmId[];
  onPick: (id: CharmId) => void;
}

export function LevelUpPicker({ choices, onPick }: Props) {
  return (
    <div className="overlay levelup-overlay">
      <div className="modal levelup-modal">
        <h2>LEVEL UP</h2>
        <p className="modal-sub">Choose a burden charm</p>
        <div className="charm-grid">
          {choices.map((id) => {
            const def = CHARM_DEFS[id];
            return (
              <button
                key={id}
                type="button"
                className="charm-card"
                style={{ borderColor: def.color }}
                onClick={() => {
                  musicEngine.playSfx('level_up');
                  onPick(id);
                }}
              >
                <div className="charm-icon" style={{ background: def.color }} />
                <h3>{def.name}</h3>
                <p>{def.desc}</p>
                {def.tier === 'fused' && <span className="fused-badge">FUSED</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
