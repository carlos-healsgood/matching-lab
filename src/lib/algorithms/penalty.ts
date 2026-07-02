// Penalty-floor mapping — mirrors `_apply_floor` in the generic-worker scorer.
//
//     factor = floor + (1 - floor) * component
//
// A perfect component (1.0) -> factor 1.0 (no penalty); a zero component
// (far/unknown location, very over-budget) -> factor `floor` (max penalty, but
// never 0). Monotonic, so ordering is always preserved.
export const applyFloor = (component: number, floor: number): number =>
  floor + (1 - floor) * component;

export const PRODUCTION_PENALTY_FLOOR = 0.5;
