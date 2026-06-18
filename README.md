# Burden Surge

**The world shattered. You hold the shared pain. Route it, fuse it, or overflow and break.**

A Steam-quality arena roguelite built on one radical idea: **suffering is a shared resource pool with depth, color, and discovery.** Enemies bleed typed pain into you. Overflow hurts. Mastery means routing weight to minions, structures, and fused charms — while the arena grows beneath your feet.

Double-click to play. No terminal, no browser tab.

---

## Play

**Double-click `release\Strewn.exe`** (or desktop **Strewn.lnk**) after building.

```bash
npm run electron:dev    # dev with hot reload
npm run electron:build  # portable exe → release/Strewn.exe
```

---

## Story

The world shattered into fragments. Every wound echoes across the ruins — **grief, rage, dread, and hollow silence**. You are a **Surge-bearer**: the only one who can hold the shared pain long enough to fuse it into power. Route the weight. Meld the suffering. Deploy minions as sinks. Build relays mid-run. Or overflow and break.

---

## Core Loop

1. **SURGE NOW** — interactive tutorial guides your first run (skippable).
2. **Enemies emit typed suffering** into your layered Burden Pool.
3. **Overflow damages you** when capacity is exceeded — weaponize it with charms.
4. **Level up** and pick Burden Charms (14 base types).
5. **Meld Altar** appears periodically — fuse charms into **22 discoverable hybrids** (Balatro-style "NEW RECIPE!" popup).
6. **Expand the arena** each wave; discover shrines for rewards.
7. **Build structures** mid-run (relays, sink towers, fuse shrines).
8. **Earn Meta Shards**, unlock upgrades, read the **Codex** (C key).

---

## Unique Systems

### Burden Ecology
Pain has **four types** that layer in your meter:
| Type | Color | Source |
|------|-------|--------|
| Grief | Blue | Wretches |
| Rage | Red | Howlers |
| Dread | Purple | Anchors |
| Hollow | Gray | Boss Grief Anchors |

**Synergies:** Grief + Rage → **Wrath Storm** nova. Dread + Hollow → **Miasma** enemy slow. Pain layers show in the HUD burden bar.

### World Chunks
Arena **expands each wave** — procedural Kenney dungeon tiles replace walls. Every 4 waves, a **discoverable shrine** appears (capacity, heal, or shards).

### Crafting Tree (22 Melds)
Eight original + fourteen new fusions. Silhouettes in Codex until discovered. Examples:
| Recipe | Result |
|--------|--------|
| Pulse + Lash | Wrath Storm |
| Veil + Null | Void Maw |
| Prism + Shard | Prism Storm |
| Ember + Anchor | Burning Anchor |

Full list in-game via **Codex (C)**.

### Burden Architecture
| Key | Structure | Effect |
|-----|-----------|--------|
| B | Toggle build mode | — |
| TAB | Cycle structure | Pain Relay / Sink Tower / Fuse Shrine |
| F | Place | Costs burden; persists for the run |

### Meta Layer
Shards unlock: max HP, burden cap, speed, shard bonus, minion slots, starting charm, biomes.

---

## Controls

| Input | Action |
|-------|--------|
| WASD / Arrows | Move (acceleration + friction) |
| SPACE | Deploy minion (burden sink) |
| 1 / 2 | Slot charm for meld |
| E | Fuse at Meld Altar |
| B / TAB / F | Build mode / cycle / place structure |
| C | Burden Codex |
| ESC | Pause |

---

## Tutorial Flow

1. **The Weight Returns** — movement + burden concept
2. **Pain Has Color** — four pain types (at 50% burden)
3. **Death Releases Pain** — first kill burst
4. **Share the Load** — minion deploy
5. **Meld Altar** — fusion discovery

Skip anytime. Codex remains available forever.

---

## Visual & Audio

- **Kenney Tiny Dungeon** tilemap + character sprite sheets (CC0)
- Animated walk cycles, telegraphed enemy spawns, layered pain meter
- Screen shake, hit-stop, damage numbers, particle bursts
- Glowing overflow warning pulse
- Dark moody palette + neon pain colors
- CRT scanlines (optional, off by default)
- Procedural chiptune with combat/menu/boss crossfade

---

## Assets Bundled

```
public/assets/
  tiles/tilemap_packed.png          # Kenney Tiny Dungeon tilemap
  kenney/tinydungeon/Tiles/         # 132 dungeon tiles
  sprites/player.png                # Adventurer sheet
  sprites/enemy_*.png               # Ghost, bat, spike, redeye sheets
  sprites/minion.png                # Slime sheet
  sprites/xp_gem.png                # Gold coin sheet
  sprites/shard.png                 # Gem pickup
```

Attribution: [Kenney.nl](https://kenney.nl) (CC0 1.0)

---

## Tech

React + TypeScript + Vite + Electron. Canvas game loop in `src/components/arena/BurdenArena.tsx`. Game logic in `src/game/burden/` + `src/game/arena/`. Web Audio chiptune (`MusicEngine.ts`).

---

*"The weight is yours. Pass it on."*
