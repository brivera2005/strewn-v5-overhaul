interface Props {
  onHelp: () => void;
  chapter?: string;
  day?: number;
}

export function Header({ onHelp, chapter = 'Strewn', day }: Props) {
  return (
    <header className="header">
      <div>
        <div className="header-title">Strewn · Distributed Burden Strategy</div>
        <div className="header-chapter">
          {chapter}
          {day !== undefined ? day : ''}
        </div>
      </div>
      <button type="button" className="btn-help" onClick={onHelp} aria-label="Help">
        ?
      </button>
    </header>
  );
}
