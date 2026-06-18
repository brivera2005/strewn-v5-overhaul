import { musicEngine } from '../../game/MusicEngine';

interface Props {
  remnants: number;
  totalRuns: number;
  bestKills: number;
  onStart: () => void;
  onShop: () => void;
  onSettings: () => void;
}

export function MainMenu({ remnants, totalRuns, bestKills, onStart, onShop, onSettings }: Props) {
  return (
    <div className="screen menu-screen">
      <div className="menu-bg" />
      <div className="menu-content">
        <p className="menu-tag">PAIN ROUTING ROGUELITE</p>
        <h1 className="menu-title">STREWN</h1>
        <p className="menu-story">
          The world shattered. Every wound echoes across the fragments: grief, rage, dread, and hollow silence.
          You are a Painweaver, the Router who shares suffering instead of hoarding it.
          Lash foes, place sinks, vent the weight. Meld relics at shrines. Or overflow and break.
        </p>
        <div className="menu-stats">
          <span>Remnants {remnants}</span>
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
            WEAVE PAIN
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              musicEngine.playSfx('ui_click');
              onShop();
            }}
          >
            REMNANT TREE
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
          <p>WASD move | Mouse aim | LMB Pain Lash | RMB Vent | Q Sink | E Meld | 1/2 slots | C Codex | ESC pause</p>
        </div>
      </div>
    </div>
  );
}
