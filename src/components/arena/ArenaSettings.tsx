import { musicEngine } from '../../game/MusicEngine';

interface Props {
  musicVolume: number;
  muted: boolean;
  crtScanlines: boolean;
  onSetVolume: (v: number) => void;
  onToggleMute: () => void;
  onToggleCrt: () => void;
  onBack: () => void;
}

export function ArenaSettings({
  musicVolume,
  muted,
  crtScanlines,
  onSetVolume,
  onToggleMute,
  onToggleCrt,
  onBack,
}: Props) {
  return (
    <div className="screen settings-screen">
      <div className="modal settings-modal">
        <h2>SETTINGS</h2>
        <label className="setting-row">
          <span>Music Volume</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={musicVolume}
            onChange={(e) => onSetVolume(Number(e.target.value))}
          />
        </label>
        <button type="button" className="btn-secondary" onClick={onToggleMute}>
          {muted ? 'UNMUTE' : 'MUTE'}
        </button>
        <button type="button" className="btn-secondary" onClick={onToggleCrt}>
          CRT SCANLINES: {crtScanlines ? 'ON' : 'OFF'}
        </button>
        <button
          type="button"
          className="btn-ghost"
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
