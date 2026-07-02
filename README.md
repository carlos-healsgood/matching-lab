# Matching Lab

### 🔗 Live: **https://carlos-healsgood.github.io/matching-lab/**

[![Deploy to GitHub Pages](https://github.com/carlos-healsgood/matching-lab/actions/workflows/deploy.yml/badge.svg)](https://github.com/carlos-healsgood/matching-lab/actions/workflows/deploy.yml)

Interactive playground to **see, tweak and experiment** with Healsgood's AI
matching algorithms. Point people here to build intuition for how a raw signal
(distance, skills, pay) becomes a match score — without touching the live system.

> Client-only. The scoring formulas here **mirror production** (`generic-worker`
> scorer). Nothing you change affects real matching.

## Stack

- **Vite + React + TypeScript** — instant, client-side, no backend needed.
- **Tailwind CSS v4** — styling.
- **Recharts** — interactive curves.
- **lucide-react** — icons.

## Run

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # production bundle in dist/
```

## What's here

- **Distance** (live): logistic sigmoid commute curve. Tweak `d₀` (the 50%
  point) and `k` (steepness), toggle **km / miles**, and test any distance.
  Defaults mirror production (`d₀ = 50 km ≈ 31 mi`, `k = 0.1`). Reset returns to
  production at one click.
- **Skills**, **Pay rate** — coming soon (same interface).

## Extending

- **New distance function** (e.g. segments/tramos): add a `DistanceFunction` in
  `src/lib/algorithms/distance/` and register it in `distance/index.ts`. It
  appears in the function switcher automatically; the UI renders its params from
  the `params` metadata.
- **New section** (skills, pay rate): add an entry to `src/sections/index.ts`
  and a component; wire it in `App.tsx`. The sidebar picks it up.

## Production parity

Formulas replicate the worker exactly:

- `sigmoid.scoreKm` = `1 / (1 + e^(k·(d − d₀)))` (km-canonical).
- `applyFloor(component, floor)` = `floor + (1 − floor)·component`.
- `KM_PER_MILE = 1.60934` (same constant `application-service` uses to convert
  Haversine miles → km before calling the worker).
