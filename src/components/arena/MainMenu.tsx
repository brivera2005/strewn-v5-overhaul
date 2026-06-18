import { musicEngine } from '../../game/MusicEngine';

interface Props {
  shards: number;
  totalRuns: number;
  bestKills: number;
  onStart: () => void;
  onShop: () => void;
  onSettings: () => void;
}

export function MainMenu({ shards, totalRuns, bestKills, onStart, onShop, onSettings }: Props) {
  return (
    <div className="screen menu-screen">
      <div className="menu-bg" />
      <div className="menu-content">
        <p className="menu-tag">ROGUELITE ARENA SURVIVOR</p>
        <h1 className="menu-title">BURDEN SURGE</h1>
        <p className="menu-sub">
          Absorb suffering. Overflow and die. Fuse charms. Deploy minions as burden sinks.
        </p>
        <div className="menu-stats">
          <span>Shards {shards}</span>
          <span>Runs {totalRuns}</span>
          <span>Best Kills {bestKills}</span>
        </div>
        <div className="menu-buttons">
          <button
            type="button"
            className="btn-primary btn-pulse"
            onClick={() => {
              musicEngine.playSfx('ui_click');
              onStart();
            }}
          >
            SURGE NOW
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              musicEngine.playSfx('ui_click');
              onShop();
            }}
          >
            META SHOP
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              musicEngine.playSfx('ui_click');
              onSettings();
            }}
          >
            SETTINGS
          </button>
        </div>
        <div className="menu-controls">
          <p>WASD move · SPACE deploy minion · 1/2 meld slots · E fuse at altar · ESC pause</p>
        </div>
      </div>
    </div>
  );
}
