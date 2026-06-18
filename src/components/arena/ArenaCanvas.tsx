import { useEffect, useRef } from 'react';
import { renderArena, renderHudBars } from '../../game/arena/renderer';
import type { ArenaState } from '../../game/arena/types';

interface Props {
  arenaRef: React.RefObject<ArenaState | null>;
  active: boolean;
}

export function ArenaCanvas({ arenaRef, active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    let raf = 0;

    const draw = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      const state = arenaRef.current;
      if (!canvas || !container || !state) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const rect = container.getBoundingClientRect();
      const scale = Math.min(rect.width / 960, rect.height / 640);
      const offsetX = (rect.width - 960 * scale) / 2;
      const offsetY = (rect.height - 640 * scale) / 2;

      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#0d0a14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      renderArena(ctx, state, scale, offsetX, offsetY);
      renderHudBars(ctx, state, canvas.width);

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [active, arenaRef]);

  return (
    <div className="arena-wrap" ref={containerRef}>
      <canvas ref={canvasRef} className="arena-canvas" />
    </div>
  );
}
