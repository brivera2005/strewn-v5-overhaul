interface Props {
  tick: number;
  paused: boolean;
  speed: 1 | 2 | 3;
  muted: boolean;
  latestLedger?: string;
  onTogglePause: (e: React.MouseEvent) => void;
  onSetSpeed: (speed: 1 | 2 | 3) => void;
  onToggleMute: () => void;
  playHighlight?: boolean;
}

export function ControlBar({
  tick,
  paused,
  speed,
  muted,
  latestLedger,
  onTogglePause,
  onSetSpeed,
  onToggleMute,
  playHighlight,
}: Props) {
  return (
    <div className="control-bar">
      <div className="control-left">
        <div className="tick-counter">
          Step <strong>{tick}</strong>
        </div>
        {latestLedger && <div className="mini-ledger">{latestLedger}</div>}
      </div>

      <div className="control-center">
        <button
          type="button"
          className={`btn-play ${paused && playHighlight ? 'paused highlight-pulse' : ''}`}
          data-tutorial="play-button"
          onClick={onTogglePause}
          aria-label={paused ? 'Play, advance time' : 'Pause'}
        >
          {paused ? '▶ Play' : '⏸ Pause'}
        </button>
      </div>

      <div className="control-right">
        <button
          type="button"
          className={`speed-btn ${speed === 1 ? 'active' : ''}`}
          onClick={() => onSetSpeed(1)}
          aria-label="Speed 1x"
        >
          1×
        </button>
        <button
          type="button"
          className={`speed-btn ${speed === 2 ? 'active' : ''}`}
          onClick={() => onSetSpeed(2)}
          aria-label="Speed 2x"
        >
          2×
        </button>
        <button
          type="button"
          className="speed-btn"
          onClick={onToggleMute}
          aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
          title={muted ? 'Sound off' : 'Sound on'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  );
}
