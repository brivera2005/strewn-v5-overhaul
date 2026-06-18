import { musicEngine } from '../game/MusicEngine';
import { RARITY_COLORS } from '../game/upgrades';
import type { UpgradeCard } from '../game/upgrades';

interface Props {
  cards: UpgradeCard[];
  rank: number;
  onPick: (card: UpgradeCard) => void;
}

export function UpgradePicker({ cards, rank, onPick }: Props) {
  return (
    <div className="upgrade-picker-backdrop">
      <div className="upgrade-picker-modal">
        <div className="level-up-banner">
          <h2>Director Rank {rank}!</h2>
          <p>Choose one upgrade</p>
        </div>
        <div className="upgrade-cards">
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              className={`upgrade-card rarity-${card.rarity}`}
              style={{ borderColor: RARITY_COLORS[card.rarity] }}
              onClick={() => {
                musicEngine.playSfx('level_up');
                onPick(card);
              }}
            >
              <span className="upgrade-rarity" style={{ color: RARITY_COLORS[card.rarity] }}>
                {card.rarity}
              </span>
              <h3>{card.name}</h3>
              <p>{card.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
