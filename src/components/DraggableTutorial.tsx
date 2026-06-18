import { useCallback, useEffect, useRef, useState } from 'react';
import type { TutorialStep } from '../game/State';

const BASE_STEPS: Record<
  Exclude<TutorialStep, 'complete'>,
  { step: number; title: string; body: string; why: string; target: string; defaultSide: 'left' | 'right' | 'top' }
> = {
  select_sarah: {
    step: 1,
    title: 'Click Sarah to select her',
    body: 'Sarah is a nurse. She\'s the best match for inflammatory pain like Ethan\'s fever.',
    why: 'Different helpers work better on different types of pain. Sarah has an 85% match for inflammatory pain.',
    target: '[data-member-id="sarah"]',
    defaultSide: 'right',
  },
  assign_inflammatory: {
    step: 2,
    title: 'Click the Inflammatory bar to assign her',
    body: 'Now assign Sarah to the Inflammatory pain channel, where fever and swelling live.',
    why: 'Assigning a well-matched helper starts sharing Ethan\'s burden immediately.',
    target: '[data-tutorial="channel-inflammatory"]',
    defaultSide: 'left',
  },
  press_play: {
    step: 3,
    title: 'Press Play to advance time',
    body: 'Each step forward, the family absorbs some of Ethan\'s pain. Watch his temperature drop.',
    why: 'Time only moves when you press Play. You control the pace of the night.',
    target: '[data-tutorial="play-button"]',
    defaultSide: 'top',
  },
  assign_mike: {
    step: 4,
    title: 'Assign Mike to Systemic pain',
    body: 'Select Mike, then click the Systemic channel. He\'s a 72% match for whole-body exhaustion.',
    why: 'Splitting pain across both channels gives the best overall relief.',
    target: '[data-tutorial="channel-systemic"]',
    defaultSide: 'left',
  },
};

interface Props {
  step: TutorialStep | null;
  selectedParticipantId: string | null;
}

export function DraggableTutorial({ step, selectedParticipantId }: Props) {
  const [pos, setPos] = useState({ x: 24, y: 120 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const initialized = useRef<string | null>(null);

  const getConfig = useCallback(() => {
    if (!step || step === 'complete') return null;
    if (step === 'assign_mike' && selectedParticipantId !== 'mike') {
      return {
        ...BASE_STEPS[step],
        title: 'Click Mike to select him',
        body: 'Mike is a strong match for systemic pain: the exhaustion and chills that come with fever.',
        target: '[data-member-id="mike"]',
      };
    }
    return BASE_STEPS[step];
  }, [step, selectedParticipantId]);

  useEffect(() => {
    if (!step || step === 'complete') return;
    const config = getConfig();
    if (!config) return;

    if (initialized.current === step) return;
    initialized.current = step;

    const el = document.querySelector(config.target);
    if (!el) {
      setPos({ x: 24, y: window.innerHeight - 280 });
      return;
    }

    const rect = el.getBoundingClientRect();
    const tooltipW = 360;
    const tooltipH = 220;

    let x = 24;
    let y = window.innerHeight - tooltipH - 24;

    if (config.defaultSide === 'right') {
      x = Math.min(rect.right + 20, window.innerWidth - tooltipW - 16);
      y = Math.max(16, rect.top);
    } else if (config.defaultSide === 'left') {
      x = Math.max(16, rect.left - tooltipW - 20);
      y = Math.max(16, rect.top);
    } else if (config.defaultSide === 'top') {
      x = Math.max(16, Math.min(rect.left, window.innerWidth - tooltipW - 16));
      y = Math.max(16, rect.top - tooltipH - 24);
    }

    if (step === 'press_play') {
      x = Math.max(16, rect.left - tooltipW - 32);
      y = Math.max(16, rect.top - tooltipH - 16);
    }

    setPos({ x, y });
  }, [step, getConfig]);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: MouseEvent) => {
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 360, e.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 200, e.clientY - dragOffset.current.y)),
      });
    };
    const onUp = () => setDragging(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  const config = getConfig();
  if (!step || step === 'complete' || !config) return null;

  const onDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    setDragging(true);
  };

  return (
    <div className="tutorial-overlay-v3" aria-live="polite">
      <div
        className="tutorial-tooltip draggable"
        style={{ left: pos.x, top: pos.y }}
      >
        <div className="tutorial-drag-handle" onMouseDown={onDragStart}>
          <span className="drag-dots">⋮⋮</span>
          <span>Move me</span>
        </div>
        <div className="tutorial-step-num">Step {config.step} of 4</div>
        <h3>{config.title}</h3>
        <p>{config.body}</p>
        <p className="why">
          <strong>Why:</strong> {config.why}
        </p>
      </div>
    </div>
  );
}
