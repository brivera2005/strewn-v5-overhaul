import type { LootItem } from '../game/loot';
import { RARITY_COLORS } from '../game/loot';

interface Props {
  items: LootItem[];
  onPick: (item: LootItem) => void;
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
