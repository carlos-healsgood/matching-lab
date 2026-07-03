import { num, type DistanceFunction } from "./types";

// Logistic sigmoid commute curve — the function currently shipping in production.
//
//     score = 1 / (1 + e^(k * (d - d0)))
//
// ~1 within a comfortable commute, exactly 0.5 at d0 (the 50%-willingness
// distance), asymptotically -> 0 (never exactly 0) when too far.
//
// Production defaults are tuned in KM: d0 = 50 km (~= 31 miles), k = 0.1.
export const sigmoid: DistanceFunction = {
  id: "sigmoid",
  label: "Sigmoid",
  status: "active",
  recommended: true,
  formula: "score = 1 / (1 + e^(k · (d − d₀)))",
  description:
    "S-shaped commute-willingness curve: a flat plateau near the workplace, a decisive drop through the midpoint d₀, and a long asymptotic tail (never a hard cliff). Two knobs: d₀ (the 50% point) and k (how sharp the drop is).",
  params: [
    {
      key: "d0",
      label: "Midpoint d₀",
      kind: "distance",
      min: 1,
      max: 100,
      step: 0.5,
      hint: "Distance at which willingness = 50%.",
    },
    {
      key: "k",
      label: "Steepness k",
      kind: "plain",
      min: 0.02,
      max: 0.6,
      step: 0.005,
      suffix: "per km",
      hint: "Higher k = sharper cut-off around d₀.",
    },
  ],
  defaults: { d0: 50, k: 0.1 },
  scoreKm: (dKm, p) => {
    const x = num(p.k) * (dKm - num(p.d0));
    if (x >= 709) return 0; // guard Math.exp overflow (score ~0 anyway)
    return 1 / (1 + Math.exp(x));
  },
};
