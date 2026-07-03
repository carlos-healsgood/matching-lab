// Contract every distance scoring function implements, so the UI can render and
// drive any of them generically (add a new function -> it shows up automatically).

export type ParamKind = "distance" | "plain" | "bands";

/** A single step in the piecewise ("bandas") function. */
export interface Band {
  width: number; // span of this band in km (canonical)
  drop: number; // score fall (0..1) applied when leaving this band
}

export type ParamValue = number | Band[];

export interface ParamDef {
  key: string;
  label: string;
  kind: ParamKind;
  // scalar-only (kind "distance" | "plain"):
  min?: number;
  max?: number;
  step?: number;
  suffix?: string; // e.g. "per km"
  hint?: string;
}

export interface DistanceFunction {
  id: string;
  label: string;
  status: "active" | "soon";
  recommended?: boolean;
  /** human formula for display (rendered as-is) */
  formula: string;
  description: string;
  params: ParamDef[];
  /** PRODUCTION / sensible defaults, canonical units (distance params in km). */
  defaults: Record<string, ParamValue>;
  /** score in [0,1] for a distance in KM given canonical params. */
  scoreKm: (dKm: number, p: Record<string, ParamValue>) => number;
}

// helpers for reading typed params inside scoreKm
export const num = (v: ParamValue | undefined, fallback = 0): number =>
  typeof v === "number" ? v : fallback;
export const bands = (v: ParamValue | undefined): Band[] =>
  Array.isArray(v) ? v : [];
