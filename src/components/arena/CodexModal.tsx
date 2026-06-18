import { allCodexEntries } from '../../game/strewn/codex';
import type { CharmId } from '../../game/arena/types';

interface Props {
  discoveredMelds: CharmId[];
  onClose: () => void;
}

export function CodexModal({ discoveredMelds, onClose }: Props) {
  const entries = allCodexEntries(discoveredMelds);
  const categories = ['core', 'ecology', 'network', 'melds', 'meta'] as const;
  const labels: Record<string, string> = {
    core: 'Core Systems',
    ecology: 'Pain Types',
    network: 'Pain Network',
    melds: 'Meld Recipes',
    meta: 'Meta Layer',
  };

  return (
    <div className="modal-overlay codex-overlay">
      <div className="modal-panel codex-panel">
        <h2 className="modal-title">STREWN CODEX</h2>
        <p className="modal-sub">Press C during a run · {discoveredMelds.length} melds discovered</p>
        <div className="codex-scroll">
          {categories.map((cat) => {
            const items = entries.filter((e) => e.category === cat);
            if (items.length === 0) return null;
            return (
              <section key={cat} className="codex-section">
                <h3 className="codex-cat">{labels[cat]}</h3>
                {items.map((e) => (
                  <div key={e.id} className="codex-entry">
                    <strong>{e.title}</strong>
                    <p>{e.body}</p>
                  </div>
                ))}
              </section>
            );
          })}
        </div>
        <button type="button" className="btn-secondary" onClick={onClose}>
          CLOSE [C]
        </button>
      </div>
    </div>
  );
}
