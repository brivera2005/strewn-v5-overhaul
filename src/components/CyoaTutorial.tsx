import { getCyoaNode } from '../game/tutorialFlow';
import type { CyoaChoice } from '../game/tutorialFlow';

interface Props {
  nodeId: string;
  onChoose: (choice: CyoaChoice) => void;
  onAdvance: (target: 'chapter0' | 'triage' | 'continue') => void;
}

export function CyoaTutorial({ nodeId, onChoose, onAdvance }: Props) {
  const node = getCyoaNode(nodeId);

  return (
    <div className="screen cyoa-screen">
      <div className="cyoa-card glass-panel">
        <div className="cyoa-chapter">Awakening</div>
        <h1 className="cyoa-title">{node.title}</h1>
        <p className="cyoa-body">{node.body}</p>
        {node.teaches && (
          <p className="cyoa-teaches">
            <span className="cyoa-teaches-label">You learn:</span> {node.teaches}
          </p>
        )}

        {node.advance && (
          <button
            type="button"
            className="btn-primary cyoa-btn"
            onClick={() => onAdvance(node.advance!)}
          >
            Continue
          </button>
        )}

        {node.choices && (
          <div className="cyoa-choices">
            {node.choices.map((choice) => (
              <button
                key={choice.label}
                type="button"
                className="cyoa-choice-btn"
                onClick={() => onChoose(choice)}
              >
                {choice.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
