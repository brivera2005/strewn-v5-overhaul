import { CREDITS_TEXT } from '../game/constants';

interface Props {
  onBack: () => void;
}

export function CreditsScreen({ onBack }: Props) {
  return (
    <div className="screen credits-screen">
      <div className="screen-title pixel-text">Credits</div>
      {CREDITS_TEXT.map((line, i) => (
        <p key={i} className="credits-line">{line}</p>
      ))}
      <button type="button" className="btn-primary" onClick={onBack} style={{ marginTop: '2rem' }}>
        Back
      </button>
    </div>
  );
}
