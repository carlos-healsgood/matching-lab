import { num, type DistanceFunction } from "./types";

// Straight-line decay from 1 at d=0 down to 0 at `zeroAt`. The slope is
// 1 / zeroAt per km — editing where it hits 0 is the intuitive way to set it.
export const linear: DistanceFunction = {
  id: "linear",
  label: "Linear",
  status: "active",
  formula: "score = max(0, 1 − d / d₀)",
  description:
    "Constant-rate decline: the score falls in a straight line and hits 0 at the cutoff distance. Set the slope by choosing where it reaches 0.",
  params: [
    {
      key: "zeroAt",
      label: "Reaches 0 at",
      kind: "distance",
      min: 5,
      max: 150,
      step: 1,
      hint: "Cutoff distance (defines the slope = 1 / this).",
    },
  ],
  defaults: { zeroAt: 55 },
  scoreKm: (dKm, p) => Math.max(0, 1 - dKm / num(p.zeroAt, 1)),
};
