// Distance unit helpers.
//
// Canonical unit across the whole app is KILOMETRES — exactly like production:
// the worker scores in km (application-service computes miles via Haversine and
// converts miles -> km with this same factor before calling the scorer).
export const KM_PER_MILE = 1.60934; // mirrors application-service/src/shared/math-helpers.ts

export type Unit = "km" | "mi";

export const kmToMiles = (km: number): number => km / KM_PER_MILE;
export const milesToKm = (mi: number): number => mi * KM_PER_MILE;

/** Convert a canonical km value into the given display unit. */
export const fromKm = (km: number, unit: Unit): number =>
  unit === "mi" ? kmToMiles(km) : km;

/** Convert a value expressed in the given display unit back to canonical km. */
export const toKm = (value: number, unit: Unit): number =>
  unit === "mi" ? milesToKm(value) : value;

export const unitLabel = (unit: Unit): string => (unit === "mi" ? "miles" : "km");
export const unitShort = (unit: Unit): string => (unit === "mi" ? "mi" : "km");

export const round = (n: number, dp = 2): number => {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
};
