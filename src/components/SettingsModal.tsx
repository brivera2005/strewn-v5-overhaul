interface Props {
  musicVolume: number;
  muted: boolean;
  pauseOnCritical: boolean;
  tickSpeedMultiplier: 1 | 0.5 | 0.25;
  smartDefaults: boolean;
  onSetVolume: (v: number) => void;
  onToggleMute: () => void;
  onSetSetting: (key: 'pauseOnCritical' | 'tickSpeedMultiplier' | 'smartDefaults', value: boolean | 1 | 0.5 | 0.25) => void;
  onClose: () => void;
}

export function SettingsModal({
  musicVolume,
  muted,
  pauseOnCritical,
  tickSpeedMultiplier,
  smartDefaults,
  onSetVolume,
  onToggleMute,
  onSetSetting,
  onClose,
}: Props) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Settings</h2>

        <div className="help-section">
          <h3>Music Volume</h3>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(musicVolume * 100)}
            onChange={(e) => onSetVolume(Number(e.target.value) / 100)}
            className="volume-slider"
          />
          <p>{Math.round(musicVolume * 100)}%</p>
        </div>

        <div className="help-section">
          <h3>Sound</h3>
          <button type="button" className="btn-secondary" onClick={onToggleMute}>
            {muted ? 'Unmute All' : 'Mute All'}
          </button>
        </div>

        <div className="help-section">
          <h3>Gameplay</h3>
          <label className="setting-toggle">
            <input
              type="checkbox"
              checked={pauseOnCritical}
              onChange={(e) => onSetSetting('pauseOnCritical', e.target.checked)}
            />
            Pause auto on critical event
          </label>
          <label className="setting-toggle">
            <input
              type="checkbox"
              checked={smartDefaults}
              onChange={(e) => onSetSetting('smartDefaults', e.target.checked)}
            />
            Smart defaults (highlight recommended action)
          </label>
          <p>Tick speed (for overwhelmed players)</p>
          <select
            value={tickSpeedMultiplier}
            onChange={(e) => onSetSetting('tickSpeedMultiplier', Number(e.target.value) as 1 | 0.5 | 0.25)}
          >
            <option value={1}>Normal</option>
            <option value={0.5}>Half speed</option>
            <option value={0.25}>Quarter speed</option>
          </select>
        </div>

        <button type="button" className="btn-secondary" onClick={onClose} style={{ marginTop: '1rem' }}>
          Close
        </button>
      </div>
    </div>
  );
}
