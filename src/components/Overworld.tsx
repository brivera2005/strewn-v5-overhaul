import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GameStore } from '../game/useGameStore';
import {
  getZone,
  isWalkable,
  npcAtPosition,
  spawnWandererNpcs,
  TILE_SIZE,
  transitionAt,
  type MapNpc,
} from '../game/overworldMap';
import { DialogueBox } from './DialogueBox';
import { NpcSprite, PartyFollower, PlayerSprite } from './PlayerSprite';
import { RpgEncounter, type EncounterAction } from './RpgEncounter';
import type { PatientRecord } from '../game/State';

interface OverworldProps {
  store: GameStore;
}

const MOVE_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D']);

function tileClass(tile: string): string {
  return `ow-tile ow-tile-${tile}`;
}

export function Overworld({ store }: OverworldProps) {
  const { state } = store;
  const ow = state.overworld;
  const zone = getZone(ow.zoneId);

  const [moving, setMoving] = useState(false);
  const [encounterNpc, setEncounterNpc] = useState<MapNpc | null>(null);
  const [tutorialLines, setTutorialLines] = useState<string[] | null>(null);
  const [healFlash, setHealFlash] = useState<{ daly: number; loot?: import('../game/loot').LootItem } | null>(null);
  const moveLock = useRef(false);

  const wanderNpcs = useMemo(
    () => (ow.zoneId === 'streets' || ow.zoneId === 'ward' ? spawnWandererNpcs(state.patients, ow.zoneId) : []),
    [state.patients, ow.zoneId],
  );

  const allNpcs = useMemo(() => [...zone.npcs, ...wanderNpcs], [zone.npcs, wanderNpcs]);

  const nearbyNpc = useMemo(() => {
    const dx = [-1, 0, 1, 0];
    const dy = [0, -1, 0, 1];
    for (let i = 0; i < 4; i++) {
      const n = npcAtPosition(zone, ow.playerX + dx[i], ow.playerY + dy[i], wanderNpcs);
      if (n) return n;
    }
    return npcAtPosition(zone, ow.playerX, ow.playerY, wanderNpcs);
  }, [zone, ow.playerX, ow.playerY, wanderNpcs]);

  const encounterPatient = useMemo((): PatientRecord | null => {
    if (!encounterNpc?.patientId) return null;
    if (encounterNpc.patientId === 'tutorial-ethan') {
      return {
        id: 'tutorial-ethan',
        name: 'Ethan Mitchell',
        age: 7,
        disease: 'Fever',
        painLoad: state.patientPain,
        tempF: 101.3,
        stage: 1,
        priority: 1,
        status: 'critical',
        days: 0,
        assignedNetworkSize: 0,
        matchAvg: 0,
        mortalityRisk: 30,
        ward: 'Home',
        highPainTicks: 0,
        noAllocationTicks: 0,
        dead: false,
        allocations: [],
        basePain: 44,
        icon: '🔥',
      };
    }
    return state.patients.find((p) => p.id === encounterNpc.patientId) ?? null;
  }, [encounterNpc, state.patientPain, state.patients]);

  const party = state.participants.filter((p) => p.id === 'sarah' || p.id === 'mike');

  const tryMove = useCallback(
    (dx: number, dy: number) => {
      if (encounterNpc || tutorialLines || moveLock.current) return;
      const facing =
        dy < 0 ? 'up' : dy > 0 ? 'down' : dx < 0 ? 'left' : dx > 0 ? 'right' : ow.facing;
      const nx = ow.playerX + dx;
      const ny = ow.playerY + dy;

      if (nx < 0 || ny < 0 || nx >= zone.width || ny >= zone.height) return;
      const tile = zone.tiles[ny][nx];
      if (!isWalkable(tile)) return;
      if (npcAtPosition(zone, nx, ny, wanderNpcs)) return;

      const trans = transitionAt(zone, nx, ny);
      if (trans) {
        if (trans.requiresUnlock && !ow.unlockedZones.includes(trans.requiresUnlock)) {
          store.showOverworldToast('Area locked. Heal more patients to unlock.');
          return;
        }
        store.moveOverworldPlayer(nx, ny, facing);
        store.changeZone(trans.targetZone, trans.targetX, trans.targetY);
        return;
      }

      setMoving(true);
      moveLock.current = true;
      store.moveOverworldPlayer(nx, ny, facing);
      setTimeout(() => {
        setMoving(false);
        moveLock.current = false;
      }, 120);

      if (ow.tutorialStep === 'walk_sarah' && nx === 4 && ny === 6) {
        setTutorialLines([
          'Sarah turns to you.',
          'Select me for inflammatory care. Walk up to Ethan and press E to heal.',
        ]);
        store.advanceOverworldTutorial('walk_ethan');
      }
      if (ow.tutorialStep === 'walk_ethan' && (nx === 5 || nx === 4) && ny <= 5) {
        store.advanceOverworldTutorial('first_heal');
      }
    },
    [encounterNpc, tutorialLines, ow, zone, wanderNpcs, store],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (state.overworld.showCommandMenu) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        store.toggleCommandMenu();
        return;
      }

      if (encounterNpc) {
        if (e.key === 'Escape') setEncounterNpc(null);
        return;
      }

      if (tutorialLines) {
        if (e.key === ' ' || e.key === 'Enter') setTutorialLines(null);
        return;
      }

      if (e.key === ' ' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        if (nearbyNpc) setEncounterNpc(nearbyNpc);
        return;
      }

      if (!MOVE_KEYS.has(e.key)) return;
      e.preventDefault();
      const map: Record<string, [number, number]> = {
        ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
        ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
        ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
        ArrowRight: [1, 0], d: [1, 0], D: [1, 0],
      };
      const d = map[e.key];
      if (d) tryMove(d[0], d[1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.overworld.showCommandMenu, encounterNpc, tutorialLines, nearbyNpc, tryMove, store]);

  const handleEncounter = (action: EncounterAction) => {
    if (!encounterPatient) return;
    const result = store.resolveEncounter(encounterPatient.id, action);
    if (result.daly > 0) {
      setHealFlash({ daly: result.daly, loot: result.loot });
      setTimeout(() => setHealFlash(null), 1800);
    }
    if (ow.tutorialStep === 'first_heal') {
      store.advanceOverworldTutorial('done');
    }
  };

  const px = ow.playerX * TILE_SIZE;
  const py = ow.playerY * TILE_SIZE;

  const family = state.participants.filter((p) => !p.id.startsWith('minion-'));
  const hp = Math.round(family.reduce((s, p) => s + p.le, 0) / Math.max(1, family.length));
  const mp = Math.round(state.playerStats.burdenCapacity);

  return (
    <div className="overworld-screen">
      <div className="overworld-hud">
        <div className="ow-hud-left">
          <span className="ow-zone-name">{zone.name}</span>
          <span className="ow-stat">Day {state.tick}</span>
        </div>
        <div className="ow-hud-center">
          <span className="ow-counter stabilized">♥ {state.triageStats.stabilized} Stabilized</span>
          <span className="ow-counter daly">+{state.dalysSaved} DALY</span>
          <span className="ow-counter streak">🔥 {state.streakTicks} Streak</span>
          <span className="ow-counter combo">×{state.combo.multiplier.toFixed(1)} Combo</span>
        </div>
        <div className="ow-hud-right">
          <span className="ow-rank">Rank {state.directorRank}</span>
          <button type="button" className="ow-menu-btn" onClick={() => store.toggleCommandMenu()}>
            Tab · Command
          </button>
        </div>
      </div>

      <div className="ow-stats-bar">
        <div className="ow-bar">
          <label>HP</label>
          <div className="ow-bar-track"><div className="ow-bar-fill hp" style={{ width: `${hp}%` }} /></div>
          <span>{hp}</span>
        </div>
        <div className="ow-bar">
          <label>MP</label>
          <div className="ow-bar-track"><div className="ow-bar-fill mp" style={{ width: `${Math.min(100, mp)}%` }} /></div>
          <span>{mp}</span>
        </div>
      </div>

      <div className="overworld-viewport" style={{ background: zone.bgColor }}>
        <div
          className="overworld-map"
          style={{
            width: zone.width * TILE_SIZE,
            height: zone.height * TILE_SIZE,
            transform: `translate(calc(50% - ${px + TILE_SIZE / 2}px), calc(50% - ${py + TILE_SIZE / 2}px))`,
          }}
        >
          {zone.tiles.map((row, y) =>
            row.map((tile, x) => (
              <div key={`${x}-${y}`} className={tileClass(tile)} style={{ left: x * TILE_SIZE, top: y * TILE_SIZE }} />
            )),
          )}

          {party.map((m, i) => (
            <PartyFollower
              key={m.id}
              x={(ow.playerX - (i + 1) * 0.6) * TILE_SIZE + 4}
              y={ow.playerY * TILE_SIZE + 4}
              color={m.color}
              label={m.name.split(' ')[0]}
            />
          ))}

          {allNpcs.map((n) => (
            <NpcSprite
              key={n.id}
              x={n.x * TILE_SIZE}
              y={n.y * TILE_SIZE}
              color={n.color}
              name={n.name}
              sprite={n.sprite}
              nearby={nearbyNpc?.id === n.id}
              hurt={!!n.patientId}
            />
          ))}

          <PlayerSprite x={px} y={py} facing={ow.facing} moving={moving} />
        </div>
      </div>

      <div className="overworld-controls-hint">
        WASD / Arrows move · E / Space talk · Tab Command Center
      </div>

      {tutorialLines && (
        <DialogueBox
          visible
          speaker="Tutorial"
          lines={tutorialLines}
          onAdvance={() => setTutorialLines(null)}
        />
      )}

      {ow.tutorialStep === 'walk_sarah' && !tutorialLines && !encounterNpc && (
        <div className="ow-tutorial-arrow">→ Walk to Sarah</div>
      )}
      {ow.tutorialStep === 'walk_ethan' && !tutorialLines && !encounterNpc && (
        <div className="ow-tutorial-arrow">→ Walk to Ethan · Press E</div>
      )}

      {encounterNpc && encounterPatient && (
        <RpgEncounter
          patient={encounterPatient}
          speaker={encounterNpc.name}
          lines={encounterNpc.dialogue}
          inventoryCount={state.inventory.length}
          onResolve={handleEncounter}
          onClose={() => setEncounterNpc(null)}
          healFlash={healFlash}
        />
      )}
    </div>
  );
}
