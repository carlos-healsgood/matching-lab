// Contract every distance scoring function implements, so the UI can render and
// drive any of them generically (add a new function -> it shows up automatically).

export type ParamKind = "distance" | "plain";

export interface ParamDef {
  key: string;
  label: string;
  /** slider bounds + step, expressed in the param's CANONICAL unit (km for `distance`). */
  min: number;
  max: number;
  step: number;
  kind: ParamKind; // "distance" params are shown/edited in the active unit (km<->mi)
  hint?: string;
  /** short unit suffix for "plain" params, e.g. "per km" */
  suffix?: string;
}

export interface DistanceFunction {
  id: string;
  label: string;
  status: "active" | "soon";
  /** human formula for display (rendered as-is) */
  formula: string;
  description: string;
  params: ParamDef[];
  /** PRODUCTION defaults, canonical units (distance params in km). */
  defaults: Record<string, number>;
  /** score in [0,1] for a distance in KM given canonical params. */
  scoreKm: (dKm: number, p: Record<string, number>) => number;
}
