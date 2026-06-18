interface Props {
  hasSave: boolean;
  onNewGame: () => void;
  onContinue: () => void;
  onSettings: () => void;
  onCredits: () => void;
}

export function StartScreen({ hasSave, onNewGame, onContinue, onSettings, onCredits }: Props) {
  return (
    <div className="start-screen">
      <div className="start-scanlines" aria-hidden="true" />
      <div className="start-content">
        <h1 className="start-logo">
          <span className="logo-letter">S</span>
          <span className="logo-letter">T</span>
          <span className="logo-letter">R</span>
          <span className="logo-letter">E</span>
          <span className="logo-letter">W</span>
          <span className="logo-letter">N</span>
        </h1>
        <p className="start-tagline">Burden Loop · Loot · Minions</p>
        <p className="press-start blink">PRESS START</p>

        <nav className="start-menu">
          <button type="button" className="start-menu-btn" onClick={onNewGame}>
            New Game
          </button>
          {hasSave && (
            <button type="button" className="start-menu-btn" onClick={onContinue}>
              Continue
            </button>
          )}
          <button type="button" className="start-menu-btn secondary" onClick={onSettings}>
            Settings
          </button>
          <button type="button" className="start-menu-btn secondary" onClick={onCredits}>
            Credits
          </button>
        </nav>

        <p className="start-version">v5.0 · CYOA Tutorial + Burden Command</p>
      </div>
    </div>
  );
}
