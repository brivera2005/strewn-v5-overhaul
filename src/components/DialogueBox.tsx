import { useEffect, useState } from 'react';

interface DialogueBoxProps {
  speaker: string;
  lines: string[];
  choices?: { label: string; id: string }[];
  onChoice?: (id: string) => void;
  onAdvance?: () => void;
  visible: boolean;
}

export function DialogueBox({ speaker, lines, choices, onChoice, onAdvance, visible }: DialogueBoxProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [done, setDone] = useState(false);

  const currentLine = lines[lineIndex] ?? '';

  useEffect(() => {
    setLineIndex(0);
    setCharIndex(0);
    setDone(false);
  }, [lines, speaker, visible]);

  useEffect(() => {
    if (!visible || done) return;
    if (charIndex >= currentLine.length) {
      setDone(true);
      return;
    }
    const delay = 18 + Math.random() * 12;
    const t = setTimeout(() => setCharIndex((c) => c + 1), delay);
    return () => clearTimeout(t);
  }, [visible, charIndex, currentLine, done]);

  if (!visible) return null;

  const displayText = currentLine.slice(0, charIndex);
  const isLastLine = lineIndex >= lines.length - 1;
  const showChoices = done && isLastLine && choices && choices.length > 0;
  const showContinue = done && !showChoices && (!isLastLine || onAdvance);

  const handleClick = () => {
    if (!done) {
      setCharIndex(currentLine.length);
      setDone(true);
      return;
    }
    if (showChoices) return;
    if (!isLastLine) {
      setLineIndex((i) => i + 1);
      setCharIndex(0);
      setDone(false);
    } else {
      onAdvance?.();
    }
  };

  return (
    <div className="dialogue-box" onClick={handleClick} role="dialog" aria-label="Dialogue">
      <div className="dialogue-box-inner">
        <div className="dialogue-speaker">{speaker}</div>
        <p className="dialogue-text">
          {displayText}
          {!done && <span className="dialogue-cursor">▌</span>}
        </p>
        {showContinue && (
          <div className="dialogue-hint blink">▼ Press Space or Click</div>
        )}
        {showChoices && (
          <div className="dialogue-choices">
            {choices.map((c) => (
              <button
                key={c.id}
                type="button"
                className="dialogue-choice-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onChoice?.(c.id);
                }}
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
