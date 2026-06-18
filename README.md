# STREWN

**STREWN** is a top-down action roguelite about **pain mitigation and sharing burden** across a shattered world. You are a Painweaver: route suffering through sink nodes, vent overload, and meld relics at shrines.

## Pitch

The world fractured. Every wound echoes as colored pain: grief, rage, dread, and hollow ache. Enemies bleed suffering into you. Your job is not to tank it alone but to **route** it: lash foes, collect pain orbs, place typed sink nodes, and stand between clusters as the living router. Vent when the Burden Bar threatens overflow. Survive 20-minute runs, beat bosses every 5 waves, and spend **Remnants** on permanent upgrades.

## Controls

| Input | Action |
|-------|--------|
| WASD | Move |
| Mouse | Aim |
| Left Click | Pain Lash (marks enemies for routing) |
| Right Click | Vent Burden (shockwave, sheds weight) |
| Q | Place Sink Node at cursor |
| E | Meld at shrine (when active) |
| 1 / 2 | Slot relics for melding |
| C | Codex |
| ESC | Pause |

## Pain Network

1. **Lash** enemies with left click. Hits mark them and deal damage.
2. Press **Q** to place a **Sink Node** (max 2 early, more via upgrades). Each sink has a pain type affinity.
3. Marked enemies bleed pain along visible bezier paths: **enemy → you (router) → sink**.
4. **Match** sink color to pain type for efficient routing. Mismatched routing costs **2x burden**.
5. Walk between enemy clusters and sinks to tighten routes.
6. At **wave 5+**, **Strain Echo** unlocks: faint lash afterimages (subtle, not orbiting minions).

## Run Loop

- Main menu → skippable 5-step tutorial on first launch
- Waves escalate over ~20 minutes; boss every 5 waves
- Level up: choose 1 of 3 relic upgrades
- Death → earn Remnants → permanent unlock tree
- Meld hybrid relics at shrines; discoveries saved in Codex

## Development

```bash
npm install
npm run dev          # Vite dev server
npm run build        # Production build
npm run electron:dev # Desktop dev
npm run electron:build  # Portable Strewn.exe
```

## Assets

- **Sprites**: [Kenney Tiny Dungeon](https://kenney.nl/assets/tiny-dungeon) (CC0), bundled under `public/assets/`
- **Music**: CC0 chiptune loops from [OpenGameArt](https://opengameart.org) (`menu.ogg`, `combat.ogg`, `boss.ogg`)
- **Fonts**: Press Start 2P, Pixelify Sans (Google Fonts)

## License

Game code: project license. Third-party assets retain their respective licenses (Kenney CC0, OpenGameArt CC0 where noted).
