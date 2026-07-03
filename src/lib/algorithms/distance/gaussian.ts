import { num, type DistanceFunction } from "./types";

// Gaussian (bell) decay: score = e^(-d² / (2σ²)). Flat-ish near the origin, then
// an accelerating drop; σ controls the spread (larger σ = more tolerant).
export const gaussian: DistanceFunction = {
  id: "gaussian",
  label: "Gaussian",
  status: "active",
  formula: "score = e^(−d² / (2σ²))",
  description:
    "Bell-curve decay: gentle near the workplace, steepest around σ, then a fast-thinning tail. One knob: σ, the spread (bigger σ tolerates longer commutes).",
  params: [
    {
      key: "sigma",
      label: "Spread σ",
      kind: "distance",
      min: 2,
      max: 60,
      step: 0.5,
      hint: "Larger σ = wider bell = more tolerant of distance.",
    },
  ],
  defaults: { sigma: 17 },
  scoreKm: (dKm, p) => {
    const s = num(p.sigma, 1);
    return Math.exp(-(dKm * dKm) / (2 * s * s));
  },
};
