import { formatTempF } from '../game/constants';
import type { EndGameReason } from '../game/State';

interface Props {
  endReason: EndGameReason;
  score: number;
  patientPain: number;
  tick: number;
  onRestart: () => void;
}

export function ResultScreen({ endReason, score, patientPain, tick, onRestart }: Props) {
  const isWin = endReason === 'win';

  const messages: Record<string, { title: string; body: string }> = {
    win: {
      title: 'Ethan is going to be okay',
      body: `His fever broke. Temperature down to ${formatTempF(patientPain)}. The family carried the night together, and everyone is still standing. Planetary triage awaits.`,
    },
    le_collapse: {
      title: 'Someone gave too much',
      body: 'A helper\'s Life Energy collapsed. When you share pain, you have to leave something for yourself. The night ended before Ethan recovered.',
    },
    pain_crisis: {
      title: 'The fever wouldn\'t break',
      body: `Ethan's pain stayed dangerously high for too long. At ${formatTempF(patientPain)}, he needed more relief than the family could provide.`,
    },
  };

  const msg = messages[endReason ?? 'pain_crisis'] ?? messages.pain_crisis;

  return (
    <div className="screen">
      <div className={`result-icon ${isWin ? 'result-win' : 'result-loss'}`}>
        {isWin ? '✓' : '✕'}
      </div>
      <div className="screen-title">{msg.title}</div>
      <p className="screen-body">{msg.body}</p>

      <div className="result-stats">
        <div className="stat-box">
          <div className="stat-value">{formatTempF(patientPain)}</div>
          <div className="stat-label">Final temperature</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{tick}</div>
          <div className="stat-label">Steps taken</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{score}</div>
          <div className="stat-label">Score</div>
        </div>
      </div>

      <button type="button" className="btn-primary" onClick={onRestart}>
        Play again
      </button>
    </div>
  );
}
