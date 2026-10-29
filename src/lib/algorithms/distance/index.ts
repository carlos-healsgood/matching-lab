import type { DistanceFunction } from "./types";
import { sigmoid } from "./sigmoid";
import { linear } from "./linear";
import { plateauLinear } from "./plateauLinear";
import { gaussian } from "./gaussian";
import { exponential } from "./exponential";
import { segments } from "./segments";
import { kneeCap } from "./kneeCap";

// Registry of distance scoring functions. Add a new one here and it appears in
// the UI automatically (the UI renders each function's params from metadata).
export const distanceFunctions: DistanceFunction[] = [
  kneeCap,
  sigmoid,
  linear,
  plateauLinear,
  gaussian,
  exponential,
  segments,
];

export const getDistanceFunction = (id: string): DistanceFunction =>
  distanceFunctions.find((f) => f.id === id) ?? sigmoid;

export type { DistanceFunction, ParamDef, Band, ParamValue } from "./types";
