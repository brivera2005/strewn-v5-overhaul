interface Props {
  onClose: () => void;
}

export function HelpModal({ onClose }: Props) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>How to play</h2>

        <div className="help-section">
          <h3>Chapter 0</h3>
          <p>
            Lower Ethan&apos;s fever below 100°F by assigning family members to pain channels
            and advancing time. Keep everyone&apos;s Life Energy above 15%.
          </p>
        </div>

        <div className="help-section">
          <h3>Planetary Triage</h3>
          <p>
            Manage 15-30 patients across the US. Sort and filter the database, assign volunteers
            from the network panel, and use Optimize Critical First when overwhelmed.
            Deaths are expected. Keep going.
          </p>
        </div>

        <div className="help-section">
          <h3>Controls</h3>
          <p>
            Click a family member or volunteer to select, then assign. Press Play to advance time.
            Ctrl+click to multi-select patients in triage mode.
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
