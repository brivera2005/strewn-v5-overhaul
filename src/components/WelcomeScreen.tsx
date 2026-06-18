import { WELCOME_TEXT } from '../game/constants';

interface Props {
  onContinue: (e: React.MouseEvent) => void;
}

export function WelcomeScreen({ onContinue }: Props) {
  return (
    <div className="screen">
      <div className="screen-title">{WELCOME_TEXT.title}</div>
      <p className="screen-body">{WELCOME_TEXT.body}</p>
      <p className="screen-subtitle">{WELCOME_TEXT.subtitle}</p>
      <button type="button" className="btn-primary" onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}
