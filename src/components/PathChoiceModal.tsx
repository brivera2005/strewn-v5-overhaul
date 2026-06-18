import { PATH_CHOICE_COPY } from '../game/constants';

interface Props {
  onChoose: (path: 'strewn' | 'endure', e: React.MouseEvent) => void;
}

export function PathChoiceModal({ onChoose }: Props) {
  const { title, intro, strewn, endure } = PATH_CHOICE_COPY;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="path-choice-title">
      <div className="modal">
        <h2 id="path-choice-title">{title}</h2>
        <p className="modal-intro">{intro}</p>

        <div className="choice-grid">
          <button type="button" className="choice-card" onClick={(e) => onChoose('strewn', e)}>
            <h3>{strewn.label}</h3>
            <p>{strewn.summary}</p>
            <ul className="choice-list choice-pros">
              {strewn.pros.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <ul className="choice-list choice-cons">
              {strewn.cons.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </button>

          <button type="button" className="choice-card" onClick={(e) => onChoose('endure', e)}>
            <h3>{endure.label}</h3>
            <p>{endure.summary}</p>
            <ul className="choice-list choice-pros">
              {endure.pros.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <ul className="choice-list choice-cons">
              {endure.cons.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </button>
        </div>
      </div>
    </div>
  );
}
