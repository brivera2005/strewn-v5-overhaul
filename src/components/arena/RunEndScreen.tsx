import type { RunStats } from '../../game/arena/types';
import { musicEngine } from '../../game/MusicEngine';

interface Props {
  won: boolean;
  stats: RunStats;
  onRetry: () => void;
  onMenu: () => void;
  onShop: () => void;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function RunEndScreen({ won, stats, onRetry, onMenu, onShop }: Props) {
  return (
    <div className="screen end-screen">
      <div className="end-content">
        <h1 className={won ? 'victory' : 'defeat'}>{won ? 'PAIN DISSOLVED' : 'OVERFLOW'}</h1>
        <p className="end-sub">{won ? 'You routed the shattered world\'s weight.' : 'The burden broke you.'}</p>
        <div className="stat-grid">
          <div><span>Time</span><strong>{formatTime(stats.time)}</strong></div>
          <div><span>Kills</span><strong>{stats.kills}</strong></div>
          <div><span>Waves</span><strong>{stats.wavesCleared}</strong></div>
          <div><span>Levels</span><strong>{stats.levelsGained}</strong></div>
          <div><span>Melds</span><strong>{stats.meldsFound}</strong></div>
          <div><span>Shrines</span><strong>{stats.shrinesFound}</strong></div>
          <div><span>Sinks</span><strong>{stats.sinksPlaced}</strong></div>
          <div><span>Pain Routed</span><strong>{stats.painRouted}</strong></div>
          <div><span>Overflows</span><strong>{stats.burdenOverflows}</strong></div>
          <div className="shard-stat"><span>Remnants</span><strong>+{stats.remnantsEarned}</strong></div>
        </div>
        <div className="menu-buttons">
          <button
            type="button"
            className="btn-primary btn-pulse"
            onClick={() => {
              musicEngine.playSfx('ui_click');
              onRetry();
            }}
          >
            ONE MORE RUN
          </button>
          <button type="button" className="btn-secondary" onClick={onShop}>
            REMNANT TREE
          </button>
          <button type="button" className="btn-ghost" onClick={onMenu}>
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}
