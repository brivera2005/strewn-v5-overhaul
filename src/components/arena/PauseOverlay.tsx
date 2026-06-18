import { musicEngine } from '../../game/MusicEngine';

interface Props {
  onResume: () => void;
  onMenu: () => void;
  onSettings: () => void;
}

export function PauseOverlay({ onResume, onMenu, onSettings }: Props) {
  return (
    <div className="overlay pause-overlay">
      <div className="modal pause-modal">
        <h2>PAUSED</h2>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            musicEngine.playSfx('ui_click');
            onResume();
          }}
        >
          RESUME
        </button>
        <button type="button" className="btn-secondary" onClick={onSettings}>
          SETTINGS
        </button>
        <button type="button" className="btn-ghost" onClick={onMenu}>
          QUIT RUN
        </button>
      </div>
    </div>
  );
}
