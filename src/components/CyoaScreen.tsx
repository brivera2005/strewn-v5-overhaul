import { getCyoaNode } from '../game/tutorialFlow';

interface Props {
  nodeId: string;
  onChoose: (nextId: string, flag?: string) => void;
  onAdvance: (target: 'chapter0' | 'triage' | 'continue') => void;
}

export function CyoaScreen({ nodeId, onChoose, onAdvance }: Props) {
  const node = getCyoaNode(nodeId);

  return (
    <div className="screen cyoa-screen">
      <div className="cyoa-card glass-panel">
        <p className="cyoa-chapter">Strewn · Chapter 0</p>
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
            {node.advance === 'chapter0' ? 'Enter the Mitchell house' : 'Continue'}
          </button>
        )}

        {node.choices && (
          <div className="cyoa-choices">
            {node.choices.map((c) => (
              <button
                key={c.label}
                type="button"
                className="cyoa-choice-btn"
                onClick={() => onChoose(c.next, c.flag)}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
