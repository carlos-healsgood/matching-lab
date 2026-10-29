import { milesToKm } from "../../units";
import { num, type DistanceFunction } from "./types";

// Proposed for production. A gentle linear fall within a normal commute, an
// exponential fall past the knee, and a hard cap beyond which AI matching does
// not show the candidate at all. People who apply themselves are always shown,
// whatever their distance, so the cap only applies to candidates AI finds.
export const kneeCap: DistanceFunction = {
  id: "knee-cap",
  label: "Knee + cap",
  status: "active",
  recommended: true,
  proposed: true,
  formula:
    "d ≤ knee: 1 − (1 − s)·d/knee · knee < d < cap: s·e^(−(d − knee)/L) · d ≥ cap: not shown",
  description:
    "Falls gently up to the knee (a normal commute), then much faster, and stops at the cap: beyond it AI matching does not show the candidate. Candidates who applied themselves are always shown, at any distance or with no address.",
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
      min: 0.5,
      max: 1,
      step: 0.01,
      hint: "1 = no fall at all within a normal commute.",
    },
    {
      key: "decay",
      label: "Fall length L past the knee",
      kind: "distance",
      min: milesToKm(10),
      max: milesToKm(200),
      step: 1,
      hint: "Every L past the knee the score drops to about a third (e⁻¹).",
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
    kneeScore: 0.9,
    decay: milesToKm(60),
    cap: milesToKm(250),
  },
  cutoffKm: (p) => num(p.cap),
  scoreKm: (dKm, p) => {
    const knee = num(p.knee);
    const kneeScore = num(p.kneeScore);
    if (dKm >= num(p.cap)) return 0;
    if (dKm <= knee) return 1 - ((1 - kneeScore) * dKm) / knee;
    return kneeScore * Math.exp(-(dKm - knee) / num(p.decay));
  },
};
