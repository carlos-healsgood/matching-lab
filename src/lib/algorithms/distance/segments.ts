import { bands, type DistanceFunction } from "./types";

// Piecewise / step function ("bandas"). Score starts at 1.0 and holds flat across
// each band's `width` (km); crossing into the next band subtracts its `drop`.
// Fully editable: add/remove bands, set each width and drop.
export const segments: DistanceFunction = {
  id: "segments",
  label: "Segments (bandas)",
  status: "active",
  formula: "step: hold flat per band width, drop between bands",
  description:
    "Piecewise steps: the score stays flat within each band, then falls by a fixed amount at each boundary. Define the width of every band and the drop between them.",
  params: [
    {
      key: "bands",
      label: "Bands",
      kind: "bands",
      hint: "Each band: how far it spans, and how much the score drops after it.",
    },
  ],
  defaults: {
    bands: [
      { width: 10, drop: 0.15 },
      { width: 10, drop: 0.3 },
      { width: 15, drop: 0.35 },
      { width: 15, drop: 0.2 },
    ],
  },
  scoreKm: (dKm, p) => {
    let level = 1;
    let cursor = 0;
    for (const b of bands(p.bands)) {
      if (dKm < cursor + b.width) return Math.max(0, level);
      cursor += b.width;
      level -= b.drop;
    }
    return Math.max(0, level);
  },
};
