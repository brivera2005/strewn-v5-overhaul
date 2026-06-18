import { useEffect } from 'react';
import type { ToastMessage } from '../game/State';

interface Props {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}

export function ToastSystem({ toasts, onDismiss }: Props) {
  useEffect(() => {
    const timers = toasts.map((t) =>
      setTimeout(() => onDismiss(t.id), 3500),
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, onDismiss]);

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => onDismiss(t.id)}>
          {t.text}
        </div>
      ))}
    </div>
  );
}
