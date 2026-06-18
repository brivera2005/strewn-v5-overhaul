import { SHOP_ITEMS, START_CHARMS } from '../../game/arena/save';
import { CHARM_DEFS } from '../../game/arena/charms';
import type { MetaSave } from '../../game/arena/types';
import { musicEngine } from '../../game/MusicEngine';

interface Props {
  meta: MetaSave;
  onBuy: (id: keyof MetaSave['upgrades'], cost: number) => void;
  onBuyCharm: (id: (typeof START_CHARMS)[0]['id'], cost: number) => void;
  onBack: () => void;
}

export function MetaShop({ meta, onBuy, onBuyCharm, onBack }: Props) {
  return (
    <div className="screen shop-screen">
      <div className="shop-content">
        <h1>META SHOP</h1>
        <p className="shop-shards">Shards: {meta.shards}</p>
        <div className="shop-grid">
          {SHOP_ITEMS.map((item) => {
            const level = meta.upgrades[item.id] as number;
            const maxed = level >= item.maxLevel;
            const cost = item.cost(level);
            return (
              <div key={item.id} className="shop-card">
                <h3>{item.name}</h3>
                <p>{item.desc}</p>
                <p className="shop-level">Lv {level}/{item.maxLevel}</p>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={maxed || meta.shards < cost}
                  onClick={() => onBuy(item.id, cost)}
                >
                  {maxed ? 'MAXED' : `${cost} shards`}
                </button>
              </div>
            );
          })}
        </div>
        <h2 className="shop-section">Starting Charm (one-time)</h2>
        <div className="shop-grid">
          {START_CHARMS.map((sc) => {
            const owned = meta.upgrades.startCharm === sc.id;
            const anyOwned = meta.upgrades.startCharm !== null;
            const def = CHARM_DEFS[sc.id];
            return (
              <div key={sc.id} className="shop-card" style={{ borderColor: def.color }}>
                <h3>{def.name}</h3>
                <p>{def.desc}</p>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={anyOwned || meta.shards < sc.cost}
                  onClick={() => onBuyCharm(sc.id, sc.cost)}
                >
                  {owned ? 'EQUIPPED' : anyOwned ? 'LOCKED' : `${sc.cost} shards`}
                </button>
              </div>
            );
          })}
        </div>
        <h2 className="shop-section">Discovered Melds</h2>
        <div className="meld-list">
          {meta.discoveredMelds.length === 0 ? (
            <p>Fuse charms at the Meld Altar to discover hybrids.</p>
          ) : (
            meta.discoveredMelds.map((id) => (
              <span key={id} className="meld-chip" style={{ borderColor: CHARM_DEFS[id].color }}>
                {CHARM_DEFS[id].name}
              </span>
            ))
          )}
        </div>
        <button
          type="button"
          className="btn-ghost shop-back"
          onClick={() => {
            musicEngine.playSfx('ui_click');
            onBack();
          }}
        >
          BACK
        </button>
      </div>
    </div>
  );
}
