interface Props {
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: '?', action: 'Open keyboard shortcuts' },
  { keys: 'Ctrl+Z', action: 'Undo last assignment' },
  { keys: 'Space', action: 'Toggle pause/play' },
  { keys: '1 / 2 / 3', action: 'Set game speed' },
  { keys: 'Ctrl+Click', action: 'Multi-select patients' },
  { keys: 'Escape', action: 'Close drawer / modal' },
  { keys: 'Tab', action: 'Cycle triage tabs' },
  { keys: 'Enter', action: 'Open patient detail drawer' },
  { keys: 'O', action: 'Optimize critical first' },
  { keys: 'F', action: 'Focus search bar' },
];

export function KeyboardShortcutsPanel({ onClose }: Props) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Keyboard Shortcuts</h2>
        <div className="shortcuts-list">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="shortcut-row">
              <kbd>{s.keys}</kbd>
              <span>{s.action}</span>
            </div>
          ))}
        </div>
        <button type="button" className="btn-secondary" onClick={onClose} style={{ marginTop: '1rem' }}>
          Close
        </button>
      </div>
    </div>
  );
}
