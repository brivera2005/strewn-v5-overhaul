import { getTutorialStep } from '../../game/strewn/tutorial';

interface Props {
  stepId: string | null;
  onNext: () => void;
  onSkipAll: () => void;
}

export function TutorialOverlay({ stepId, onNext, onSkipAll }: Props) {
  if (!stepId) return null;
  const step = getTutorialStep(stepId);
  if (!step) return null;

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-card">
        <p className="tutorial-label">PAINWEAVER GUIDE</p>
        <h3 className="tutorial-title">{step.title}</h3>
        <p className="tutorial-body">{step.body}</p>
        <div className="tutorial-actions">
          <button type="button" className="btn-primary" onClick={onNext}>
            GOT IT
          </button>
          {step.skippable && (
            <button type="button" className="btn-ghost" onClick={onSkipAll}>
              SKIP TUTORIAL
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
