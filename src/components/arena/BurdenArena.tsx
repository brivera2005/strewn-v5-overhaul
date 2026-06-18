import { useEffect, useRef, useState } from 'react';
import { renderArena, renderHudBars } from '../../game/arena/renderer';
import { loadAssets } from '../../game/burden/assets';
import type { ArenaState } from '../../game/arena/types';

interface Props {
  arenaRef: React.RefObject<ArenaState | null>;
  active: boolean;
  crtScanlines?: boolean;
}

export function BurdenArena({ arenaRef, active, crtScanlines = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [assetsReady, setAssetsReady] = useState(false);

  useEffect(() => {
    loadAssets().then(() => setAssetsReady(true)).catch(() => setAssetsReady(true));
  }, []);

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

      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#08060f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (assetsReady) {
        renderArena(ctx, state, scale, offsetX, offsetY, crtScanlines);
        renderHudBars(ctx, state, canvas.width);
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [active, arenaRef, assetsReady, crtScanlines]);

  return (
    <div className="arena-wrap" ref={containerRef}>
      <canvas ref={canvasRef} className="arena-canvas" />
    </div>
  );
}

/** @deprecated use BurdenArena */
export const ArenaCanvas = BurdenArena;
