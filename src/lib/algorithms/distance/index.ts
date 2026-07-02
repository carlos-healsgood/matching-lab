import type { DistanceFunction } from "./types";
import { sigmoid } from "./sigmoid";

// Registry of distance scoring functions. Add a new one here and it appears in
// the UI automatically. "soon" entries render as disabled/preview.
export const distanceFunctions: DistanceFunction[] = [
  sigmoid,
  {
    id: "segments",
    label: "Segments (tramos)",
    status: "soon",
    formula: "piecewise: 100 within band → linear decay → 0 past cutoff",
    description:
      "Banded/piecewise scoring: full score inside a comfortable band, linear decay to a hard cutoff. Coming soon.",
    params: [],
    defaults: {},
    scoreKm: () => 0,
  },
];

export const getDistanceFunction = (id: string): DistanceFunction =>
  distanceFunctions.find((f) => f.id === id) ?? sigmoid;

export type { DistanceFunction, ParamDef } from "./types";
