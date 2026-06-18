# Strewn — Burden Loop v5

**Share the weight. Stack the loot. Deploy the minions.**

Double-click to play. No terminal, no browser tab.

---

## Play (easiest)

**Double-click `launch-strewn.bat`** or **`release\Strewn.exe`** after building.

---

## What's new in v5

- **CYOA tutorial** — choose-your-own-adventure intro that reveals mechanics one at a time
- **Family + minions** — your household in Chapter 0; abstract minion constructs in triage (no NPC volunteers)
- **Loot & stats** — relics drop on stabilizations; Resilience, Insight, Burden Capacity, Relief Power stack
- **Addiction loop** — combos, streaks, rank-up upgrades, research tree, daily objectives
- **World map removed** — focus on command center, triage DB, minion deployment

---

## How to play

1. **New Game** → CYOA story teaches pain channels, family, and the Strewn philosophy
2. **Chapter 0** → guided tutorial: assign Sarah → Inflammatory → Play → Mike → Systemic → path choice
3. **CYOA bridge** → learn about minions and loot before entering triage
4. **Burden Command** → deploy minions, pick upgrades, collect relics, save cases

### Controls

| Input | Action |
|-------|--------|
| Click family/minion | Select helper |
| Click pain channel | Assign selected helper |
| Play / Pause | Advance or stop time |
| 1× / 2× / 3× | Simulation speed |
| ? | Keyboard shortcuts |

---

## Build commands

| Command | Output |
|---------|--------|
| `npm run build` | Frontend → `dist/` |
| `npm run electron:build` | Portable exe → `release/Strewn.exe` |
| `npm run electron:dev` | Dev window with hot reload |

---

## Tech stack

React + TypeScript + Vite + Electron/Tauri. Core simulation in `src/game/Simulation.ts`.

---

*"Today it's us. Tomorrow you'll run the registry."*
