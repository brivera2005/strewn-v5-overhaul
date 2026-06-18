import { CHARM_DEFS } from '../../game/arena/charms';
import type { CharmId } from '../../game/arena/types';

interface Props {
  charmId: CharmId;
  onDismiss: () => void;
}

export function MeldDiscoveryPopup({ charmId, onDismiss }: Props) {
  const def = CHARM_DEFS[charmId];

  return (
    <div className="meld-popup">
      <div className="meld-discovery-inner">
        <p className="meld-discovery-tag">NEW RECIPE!</p>
        <div className="meld-discovery-icon" style={{ background: def.color }} />
        <h2>{def.name}</h2>
        <p>{def.desc}</p>
        <button type="button" className="btn-primary btn-pulse" onClick={onDismiss}>
          DISCOVERED
        </button>
      </div>
    </div>
  );
}
