import { num, type DistanceFunction } from "./types";

// Exponential decay: score = e^(-λ·d). Fastest drop right from d=0, with a long
// thin tail. λ is the decay rate per km (larger λ = faster drop).
export const exponential: DistanceFunction = {
  id: "exponential",
  label: "Exponential",
  status: "active",
  formula: "score = e^(−λ · d)",
  description:
    "Memoryless decay: steepest immediately from the origin, then a long thin tail. One knob: λ, the decay rate per km (larger λ = drops faster).",
  params: [
    {
      key: "lambda",
      label: "Decay rate λ",
      kind: "plain",
      min: 0.01,
      max: 0.5,
      step: 0.005,
      suffix: "per km",
      hint: "Half the score every ln(2)/λ km.",
    },
  ],
  defaults: { lambda: 0.07 },
  scoreKm: (dKm, p) => Math.exp(-num(p.lambda) * dKm),
};
