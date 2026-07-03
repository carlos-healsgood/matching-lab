import { num, type DistanceFunction } from "./types";

// Flat at 1 up to `plateau` (no penalty inside a comfortable commute), then a
// straight-line decline to 0 at `zeroAt`.
export const plateauLinear: DistanceFunction = {
  id: "plateau-linear",
  label: "Plateau + linear",
  status: "active",
  formula: "score = 1 if d ≤ p; else max(0, 1 − (d − p)/(d₀ − p))",
  description:
    "No penalty at all within a comfortable band, then a constant-rate linear decline to 0. Set the flat distance (plateau) and where it finally reaches 0.",
  params: [
    {
      key: "plateau",
      label: "Flat until (plateau)",
      kind: "distance",
      min: 0,
      max: 80,
      step: 1,
      hint: "Distance with no penalty at all.",
    },
    {
      key: "zeroAt",
      label: "Reaches 0 at",
      kind: "distance",
      min: 5,
      max: 150,
      step: 1,
      hint: "Cutoff distance (must be beyond the plateau).",
    },
  ],
  defaults: { plateau: 10, zeroAt: 50 },
  scoreKm: (dKm, p) => {
    const plateau = num(p.plateau);
    const zeroAt = num(p.zeroAt);
    if (dKm <= plateau) return 1;
    if (zeroAt <= plateau) return 0;
    return Math.max(0, 1 - (dKm - plateau) / (zeroAt - plateau));
  },
};
