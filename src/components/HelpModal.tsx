interface Props {
  onClose: () => void;
}

export function HelpModal({ onClose }: Props) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>How to play</h2>

        <div className="help-section">
          <h3>CYOA Tutorial</h3>
          <p>
            New games start with a choose-your-own-adventure intro that slowly reveals what Strewn is.
            Then Chapter 0 walks you through assignments step by step.
          </p>
        </div>

        <div className="help-section">
          <h3>Chapter 0</h3>
          <p>
            Lower Ethan&apos;s fever below 100°F by assigning family to pain channels and advancing time.
            Keep everyone&apos;s Life Energy above 15%.
          </p>
        </div>

        <div className="help-section">
          <h3>Burden Command</h3>
          <p>
            Manage patients across hospital wards. Assign family and minion constructs from the
            Family &amp; Minions tab. Stabilize patients to earn loot relics that boost your stats.
          </p>
        </div>

        <div className="help-section">
          <h3>The loop</h3>
          <p>
            Assign carriers → stabilize patients → earn Relief Points and loot → rank up →
            deploy more minions → save more people.
          </p>
        </div>

        <div className="help-section">
          <h3>Pain channels</h3>
          <p>
            <strong>Inflammatory:</strong> fever, heat, swelling. Sarah matches best (85%).
            <br />
            <strong>Systemic:</strong> whole-body exhaustion and chills. Mike matches best (72%).
          </p>
        </div>

        <button type="button" className="btn-secondary" onClick={onClose} style={{ marginTop: '1rem' }}>
          Close
        </button>
      </div>
    </div>
  );
}
