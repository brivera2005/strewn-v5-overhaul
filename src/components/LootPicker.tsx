import type { LootItem } from '../game/loot';
import { LOOT_TABLE, RARITY_COLORS } from '../game/loot';
import type { OwnedLoot } from '../game/State';

interface Props {
  items: LootItem[];
  onPick: (item: LootItem) => void;
}

interface InventoryProps {
  inventory: OwnedLoot[];
}

export function InventoryPanel({ inventory }: InventoryProps) {
  const items = inventory
    .map((entry) => LOOT_TABLE.find((l) => l.id === entry.id))
    .filter((item): item is LootItem => Boolean(item));

  return (
    <div className="inventory-panel glass-panel">
      <div className="panel-label">Relic Vault</div>
      {items.length === 0 ? (
        <p className="inventory-empty">Stabilize patients to surface relics from the burden you carry.</p>
      ) : (
        <div className="loot-cards inventory-grid">
          {items.map((item) => (
            <div key={item.id} className="loot-card inventory-card" style={{ borderColor: RARITY_COLORS[item.rarity] }}>
              <span className="loot-rarity" style={{ color: RARITY_COLORS[item.rarity] }}>
                {item.rarity}
              </span>
              <span className="loot-name">{item.name}</span>
              <span className="loot-desc">{item.description}</span>
              <span className="loot-slot">{item.slot}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function LootPicker({ items, onPick }: Props) {
  return (
    <div className="modal-overlay loot-picker-overlay">
      <div className="loot-picker glass-panel">
        <h2>Loot Drop</h2>
        <p className="loot-picker-sub">A relic surfaces from the burden you carried.</p>
        <div className="loot-cards">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="loot-card"
              style={{ borderColor: RARITY_COLORS[item.rarity] }}
              onClick={() => onPick(item)}
            >
              <span className="loot-rarity" style={{ color: RARITY_COLORS[item.rarity] }}>
                {item.rarity}
              </span>
              <span className="loot-name">{item.name}</span>
              <span className="loot-desc">{item.description}</span>
              <span className="loot-slot">{item.slot}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
