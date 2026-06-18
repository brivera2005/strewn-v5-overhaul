# Burden Surge

**Absorb suffering. Route the weight. Fuse charms. Survive the storm.**

A snappy arena roguelite built on one idea: pain is a shared resource pool. Enemies bleed burden into you. Overflow hurts. Skill means routing that weight to minions, relics, and fused abilities.

Double-click to play. No terminal, no browser tab.

---

## Play

**Double-click `release\Strewn.exe`** after building, or run `npm run electron:dev`.

---

## Core loop

1. **SURGE NOW** drops you into a top-down arena survivor run (15 min or until you shatter the final Grief Anchor).
2. **Enemies emit suffering** into your Burden meter as they live and die.
3. **Overflow damages you** when burden exceeds capacity. Charms, minions, and melds expand or redirect the pool.
4. **Level up** mid-run and pick Burden Charms (auto-attacks, drains, capacity, auras).
5. **Meld Altar** appears periodically: slot two charms (keys 1/2), press E to fuse into a stronger hybrid (Balatro-style discovery).
6. **Die or win**, earn Shards, spend them in the Meta Shop, then hit **ONE MORE RUN**.

---

## Burden mechanic

| Concept | Behavior |
|---------|----------|
| Burden Pool | Shared meter; fills from enemy proximity, deaths, and ambient suffering |
| Overflow | When full, you take escalating damage and thorns/novas may trigger |
| Minions | SPACE deploys a burden sink (costs burden); orbits you and absorbs share |
| Charms | Passive/active tools that manipulate the pool (drain, route, weaponize) |
| Grief Anchors | Boss waves every 5 waves; massive burden burst on death |

---

## Meld system

Eight base charms can fuse into six hybrids at the Meld Altar:

| Recipe | Result |
|--------|--------|
| Ember + Anchor | Burning Anchor (capacity + fire nova on overflow) |
| Conduit + Thorns | Spite Web (minion burden share + thorns) |
| Void + Conduit | Void Conduit (minions fire void bolts from held pain) |
| Ember + Relay | Ember Relay (kill relief becomes burn splash) |
| Sponge + Anchor | Grief Catalyst (passive drain + heal on pickup) |
| Shard + Ember | Burden Storm (twin orbital pain bolts) |

Discovered melds appear in the Meta Shop and can roll on future level-ups.

---

## Controls

| Input | Action |
|-------|--------|
| WASD / Arrows | Move |
| SPACE | Deploy minion (burden sink) |
| 1 / 2 | Slot charm for meld |
| E | Fuse at Meld Altar |
| ESC | Pause |
| Mouse | (future) optional aim override |

---

## Meta progression

- **Shards** from kills, waves, melds, and run performance
- **Meta Shop**: max HP, burden capacity, move speed, shard bonus, extra minion slots, starting charm (one-time)

---

## Build

| Command | Output |
|---------|--------|
| `npm run build` | Frontend to `dist/` |
| `npm run electron:build` | Portable exe to `release/Strewn.exe` |
| `npm run electron:dev` | Dev window with hot reload |

---

## Tech

React + TypeScript + Vite + Electron. Canvas arena loop in `src/game/arena/`. Procedural pixel rendering + Web Audio chiptune (`MusicEngine.ts`). Fonts: Press Start 2P, Pixelify Sans (Google Fonts).

---

## Assets

Procedural canvas art (CC0-style pixel aesthetic). Audio: procedural chiptune engine. Kenney/OpenGameArt bundles attempted; procedural fallback used where downloads were unavailable.

---

*"The weight is yours. Pass it on."*
