import { useEffect, useRef, useState } from 'react';
import { renderArena, renderHudBars } from '../../game/arena/renderer';
import { loadAssets } from '../../game/strewn/assets';
import type { ArenaState } from '../../game/arena/types';

interface Props {
  arenaRef: React.RefObject<ArenaState | null>;
  active: boolean;
  crtScanlines?: boolean;
  onCanvasTransform?: (scale: number, offsetX: number, offsetY: number) => void;
  onMouseMove?: (clientX: number, clientY: number, rect: DOMRect) => void;
  onMouseDown?: (button: number, clientX: number, clientY: number, rect: DOMRect) => void;
  onMouseUp?: (button: number) => void;
}

export function StrewnArena({
  arenaRef,
  active,
  crtScanlines = false,
  onCanvasTransform,
  onMouseMove,
  onMouseDown,
  onMouseUp,
}: Props) {
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
      onCanvasTransform?.(scale, offsetX, offsetY);

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
  }, [active, arenaRef, assetsReady, crtScanlines, onCanvasTransform]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !active) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      onMouseMove?.(e.clientX, e.clientY, rect);
    };
    const onDown = (e: MouseEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      onMouseDown?.(e.button, e.clientX, e.clientY, rect);
    };
    const onUp = (e: MouseEvent) => onMouseUp?.(e.button);
    const onCtx = (e: Event) => e.preventDefault();

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    el.addEventListener('contextmenu', onCtx);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      el.removeEventListener('contextmenu', onCtx);
    };
  }, [active, onMouseMove, onMouseDown, onMouseUp]);

  return (
    <div className="arena-wrap" ref={containerRef}>
      <canvas ref={canvasRef} className="arena-canvas" />
    </div>
  );
}

/** @deprecated use StrewnArena */
export const BurdenArena = StrewnArena;
export const ArenaCanvas = StrewnArena;
