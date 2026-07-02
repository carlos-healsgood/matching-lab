import type { DistanceFunction } from "./types";

// Logistic sigmoid commute curve — the function currently shipping in production.
//
//     score = 1 / (1 + e^(k * (d - d0)))
//
// ~1 within a comfortable commute, exactly 0.5 at d0 (the 50%-willingness
// distance), asymptotically -> 0 (never exactly 0) when too far.
//
// Production defaults are tuned in KM: d0 = 32 km (~= 19.88 miles), k = 0.155.
export const sigmoid: DistanceFunction = {
  id: "sigmoid",
  label: "Logistic sigmoid",
  status: "active",
  formula: "score = 1 / (1 + e^(k · (d − d₀)))",
  description:
    "S-shaped commute-willingness curve: a flat plateau near the workplace, a decisive drop through the midpoint d₀, and a long asymptotic tail (never a hard cliff). Two knobs: d₀ (the 50% point) and k (how sharp the drop is).",
  params: [
    {
      key: "d0",
      label: "Midpoint d₀",
      min: 1,
      max: 100,
      step: 0.5,
      kind: "distance",
      hint: "Distance at which willingness = 50%.",
    },
    {
      key: "k",
      label: "Steepness k",
      min: 0.02,
      max: 0.6,
      step: 0.005,
      kind: "plain",
      suffix: "per km",
      hint: "Higher k = sharper cut-off around d₀.",
    },
  ],
  defaults: { d0: 32, k: 0.155 },
  scoreKm: (dKm, p) => {
    const x = p.k * (dKm - p.d0);
    if (x >= 709) return 0; // guard Math.exp overflow (score ~0 anyway)
    return 1 / (1 + Math.exp(x));
  },
};
