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

- **Distance** (live), opening on the **proposed** curve, *Knee + cap*:
  - up to the knee (60 mi, a normal commute) the score falls gently, to 90 %;
  - past the knee it falls faster, fading to exactly 0 at the cap; the curvature
    `L` (60 mi) sets how hard it drops right after the knee;
  - beyond the cap (250 mi) AI matching does not show the candidate at all.
  - People who apply to a vacancy themselves are always shown, at any distance or
    with no address: the cap only applies to candidates AI finds.

  Production today runs the logistic sigmoid commute curve. Tweak `d₀` (the 50%
  point) and `k` (steepness), toggle **km / miles**, and test any distance.
  Defaults mirror production (`d₀ = 110 km ≈ 68 mi`, `k = 0.05`). Reset returns to
  production at one click.
- **Pay rate** (live): one-sided soft over-budget curve — at/under budget scores
  100%, over budget decays as `(budget/pay)^hp` (prod hp = 1.7), no stated pay → 0.
  Tune the budget and `hp`, test any candidate rate.
- **Skills** (live): exact set-overlap coverage `|required ∩ candidate| / |required|`.
  Pick the job's required skills and the candidate's skills from a shared
  vocabulary; extras are ignored, and a job with no required skills scores 100.

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
