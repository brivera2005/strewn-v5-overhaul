import { useCallback, useEffect, useRef, useState } from 'react';
import {
  applyLevelUpChoice,
  collectRunShards,
  createArenaState,
  deployMinion,
  getRunStats,
  setMeldSlot,
  tryMeld,
  updateArena,
} from './arena/engine';
import { discoverMeld, loadMeta, saveMeta } from './arena/save';
import type { CharmId, MetaSave, RunStats, Screen } from './arena/types';
import { musicEngine } from './MusicEngine';

export function useArenaStore() {
  const [meta, setMeta] = useState<MetaSave>(() => loadMeta());
  const [screen, setScreen] = useState<Screen>('menu');
  const [runStats, setRunStats] = useState<RunStats | null>(null);
  const [lastMeld, setLastMeld] = useState<CharmId | null>(null);

  const arenaRef = useRef(createArenaState(meta));
  const keysRef = useRef(new Set<string>());
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const metaRef = useRef(meta);
  metaRef.current = meta;

  const persistMeta = useCallback((next: MetaSave) => {
    setMeta(next);
    saveMeta(next);
  }, []);

  const startRun = useCallback(() => {
    arenaRef.current = createArenaState(metaRef.current);
    keysRef.current.clear();
    setRunStats(null);
    setLastMeld(null);
    setScreen('playing');
    musicEngine.resume();
    musicEngine.crossfadeTo('gameplay_ambient');
  }, []);

  const endRun = useCallback((won: boolean) => {
    const state = arenaRef.current;
    const stats = getRunStats(state, metaRef.current.upgrades.shardBonus);
    const shards = collectRunShards(state, metaRef.current);
    const nextMeta: MetaSave = {
      ...metaRef.current,
      shards: metaRef.current.shards + shards,
      totalRuns: metaRef.current.totalRuns + 1,
      bestTime: Math.max(metaRef.current.bestTime, stats.time),
      bestKills: Math.max(metaRef.current.bestKills, stats.kills),
    };
    persistMeta(nextMeta);
    setRunStats({ ...stats, shardsEarned: shards });
    setScreen(won ? 'victory' : 'gameover');
    musicEngine.playSting(won ? 'success_sting' : 'death_sting');
  }, [persistMeta]);

  const tick = useCallback((now: number) => {
    if (screen !== 'playing') return;
    const state = arenaRef.current;
    const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000 || 0.016);
    lastTimeRef.current = now;

    updateArena(state, dt, keysRef.current, metaRef.current);

    if (state.pendingLevelUp) {
      setScreen('levelup');
      musicEngine.playSfx('level_up');
      return;
    }
    if (state.dead) {
      endRun(false);
      return;
    }
    if (state.won) {
      endRun(true);
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [screen, endRun]);

  useEffect(() => {
    if (screen === 'playing') {
      lastTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [screen, tick]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysRef.current.add(k);

      if (screen === 'playing') {
        if (k === 'escape') {
          setScreen('paused');
          musicEngine.crossfadeTo('title_theme', 0.5);
        }
        if (k === ' ') {
          e.preventDefault();
          if (deployMinion(arenaRef.current, metaRef.current)) {
            musicEngine.playSfx('assign');
          }
        }
        if (k === 'e' && arenaRef.current.altarActive) {
          const result = tryMeld(arenaRef.current);
          if (result) {
            const next = discoverMeld(metaRef.current, result);
            persistMeta(next);
            setLastMeld(result);
            musicEngine.playSfx('research_unlock');
          }
        }
        if (k === '1' || k === '2') {
          const slot = k === '1' ? 0 : 1;
          const charms = arenaRef.current.charms;
          if (charms.length > slot) {
            setMeldSlot(arenaRef.current, slot as 0 | 1, charms[slot].id);
            musicEngine.playSfx('ui_click');
          }
        }
      }
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [screen, persistMeta]);

  const pickLevelUp = useCallback((id: CharmId) => {
    applyLevelUpChoice(arenaRef.current, id);
    setScreen('playing');
    musicEngine.playSfx('relief');
  }, []);

  const openShop = useCallback(() => {
    setScreen('shop');
    musicEngine.crossfadeTo('zone_streets');
  }, []);

  const openSettings = useCallback(() => {
    setScreen('settings');
    musicEngine.crossfadeTo('title_theme');
  }, []);

  const backToMenu = useCallback(() => {
    setScreen('menu');
    musicEngine.crossfadeTo('title_theme');
  }, []);

  const resume = useCallback(() => {
    setScreen('playing');
    musicEngine.crossfadeTo('gameplay_ambient');
  }, []);

  const buyUpgrade = useCallback((id: keyof MetaSave['upgrades'], cost: number) => {
    if (meta.shards < cost) return;
    const next = {
      ...meta,
      shards: meta.shards - cost,
      upgrades: { ...meta.upgrades, [id]: (meta.upgrades[id] as number) + 1 },
    };
    persistMeta(next);
    musicEngine.playSfx('ui_click');
  }, [meta, persistMeta]);

  const buyStartCharm = useCallback((charmId: CharmId, cost: number) => {
    if (meta.shards < cost || meta.upgrades.startCharm) return;
    const next = {
      ...meta,
      shards: meta.shards - cost,
      upgrades: { ...meta.upgrades, startCharm: charmId },
    };
    persistMeta(next);
    musicEngine.playSfx('research_unlock');
  }, [meta, persistMeta]);

  const setMusicVolume = useCallback((v: number) => {
    musicEngine.setMusicVolume(v);
    persistMeta({ ...meta, settings: { ...meta.settings, musicVolume: v } });
  }, [meta, persistMeta]);

  const toggleMute = useCallback(() => {
    const muted = !meta.settings.muted;
    musicEngine.setMuted(muted);
    persistMeta({ ...meta, settings: { ...meta.settings, muted } });
  }, [meta, persistMeta]);

  useEffect(() => {
    musicEngine.setMusicVolume(meta.settings.musicVolume);
    musicEngine.setMuted(meta.settings.muted);
    if (screen === 'menu') musicEngine.crossfadeTo('title_theme');
  }, []);

  return {
    meta,
    screen,
    setScreen,
    arenaRef,
    runStats,
    lastMeld,
    startRun,
    pickLevelUp,
    openShop,
    openSettings,
    backToMenu,
    resume,
    buyUpgrade,
    buyStartCharm,
    setMusicVolume,
    toggleMute,
    persistMeta,
  };
}
