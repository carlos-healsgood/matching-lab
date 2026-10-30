import { milesToKm } from "../../units";
import { num, type DistanceFunction } from "./types";

// Proposed for production. A gentle linear fall within a normal commute, then an
// exponential fall that is rescaled to reach exactly 0 at the cap, so the score
// fades out instead of jumping to 0. L sets the curvature: a short L drops hard
// right after the knee and then flattens, a long L is almost a straight line.
// Beyond the cap AI matching does not show the candidate at all. People who apply themselves are always shown,
// whatever their distance, so the cap only applies to candidates AI finds.
export const kneeCap: DistanceFunction = {
  id: "knee-cap",
  label: "Knee + cap",
  status: "active",
  recommended: true,
  proposed: true,
  formula:
    "d ≤ knee: 1 − (1 − s)·d/knee · knee < d < cap: s·(e^(−(d−knee)/L) − e^(−(cap−knee)/L)) / (1 − e^(−(cap−knee)/L)) · d ≥ cap: not shown",
  description:
    "Falls gently up to the knee (a normal commute), then faster, fading to exactly 0 at the cap: beyond it AI matching does not show the candidate. L sets how curved that fall is. Candidates who applied themselves are always shown, at any distance or with no address.",
  params: [
    {
      key: "knee",
      label: "Knee",
      kind: "distance",
      min: milesToKm(10),
      max: milesToKm(150),
      step: 1,
      hint: "End of a normal commute. The score falls gently up to here.",
    },
    {
      key: "kneeScore",
      label: "Score at the knee",
      kind: "plain",
      min: 0.2,
      max: 1,
      step: 0.01,
      hint: "1 = no fall at all within a normal commute.",
    },
    {
      key: "decay",
      label: "Curvature L past the knee",
      kind: "distance",
      min: milesToKm(15),
      max: milesToKm(500),
      step: 1,
      hint: "Short L: drops hard after the knee, then flattens. Long L: almost a straight line.",
    },
    {
      key: "cap",
      label: "Cap (not shown beyond)",
      kind: "distance",
      min: milesToKm(60),
      max: milesToKm(600),
      step: 1,
      hint: "AI matching leaves out candidates beyond this distance.",
    },
  ],
  defaults: {
    knee: milesToKm(60),
    kneeScore: 0.5,
    decay: milesToKm(45),
    cap: milesToKm(250),
  },
  cutoffKm: (p) => num(p.cap),
  scoreKm: (dKm, p) => {
    const knee = num(p.knee);
    const kneeScore = num(p.kneeScore);
    const cap = num(p.cap);
    if (dKm >= cap) return 0;
    if (dKm <= knee) return 1 - ((1 - kneeScore) * dKm) / knee;
    const L = num(p.decay);
    const atCap = Math.exp(-(cap - knee) / L);
    return (kneeScore * (Math.exp(-(dKm - knee) / L) - atCap)) / (1 - atCap);
  },
};
