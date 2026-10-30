import { kneeCap } from "../algorithms/distance/kneeCap";
import { milesToKm } from "../units";

export type Origin = "applied" | "ai";

export interface Candidate {
  id: string;
  name: string;
  origin: Origin;
  /** null = no address on file */
  distanceMi: number | null;
  note: string;
}

export interface Proposal {
  kneeMi: number;
  kneeScore: number;
  decayMi: number;
  capMi: number;
}

export const PROPOSAL: Proposal = {
  kneeMi: 60,
  kneeScore: 0.5,
  decayMi: 45,
  capMi: 250,
};

export type Zone = "commute" | "fall" | "beyond" | "unknown";

export interface Placement {
  candidate: Candidate;
  /** distance score 0-100; 0 when the address is unknown, as application-service scores it */
  score: number;
  shown: boolean;
  zone: Zone;
  reason: string;
}

export const VACANCY = "Registered Nurse · City Hospital";

export const CAST: Candidate[] = [
  { id: "maya", name: "Maya R.", origin: "applied", distanceMi: 4, note: "Lives across town" },
  { id: "lucas", name: "Lucas M.", origin: "ai", distanceMi: 14, note: "Same neighbourhood" },
  { id: "aisha", name: "Aisha K.", origin: "ai", distanceMi: 26, note: "Short drive" },
  { id: "daniel", name: "Daniel O.", origin: "applied", distanceMi: 38, note: "Normal commute" },
  { id: "ben", name: "Ben W.", origin: "ai", distanceMi: 52, note: "Long but normal commute" },
  { id: "sofia", name: "Sofia D.", origin: "ai", distanceMi: 85, note: "Just past a normal commute" },
  { id: "omar", name: "Omar F.", origin: "ai", distanceMi: 120, note: "Two-hour drive" },
  { id: "priya", name: "Priya S.", origin: "applied", distanceMi: 160, note: "Willing to relocate" },
  { id: "hannah", name: "Hannah P.", origin: "ai", distanceMi: 190, note: "Next region over" },
  { id: "leo", name: "Leo T.", origin: "ai", distanceMi: 235, note: "Close to the cap" },
  { id: "chloe", name: "Chloe B.", origin: "ai", distanceMi: 270, note: "Just past the cap" },
  { id: "ethan", name: "Ethan J.", origin: "ai", distanceMi: 640, note: "Another state" },
  { id: "tom", name: "Tom H.", origin: "applied", distanceMi: 1240, note: "Moving from another state" },
  { id: "noah", name: "Noah G.", origin: "ai", distanceMi: 3900, note: "Another country" },
  { id: "grace", name: "Grace L.", origin: "applied", distanceMi: null, note: "No address on file" },
  { id: "zoe", name: "Zoe A.", origin: "ai", distanceMi: null, note: "No address on file" },
];

export const formatMiles = (mi: number): string =>
  `${Math.round(mi).toLocaleString("en-US")} mi`;

/** Unrounded 0-100 score from the same curve the Distance tab draws, for plotting. */
export function curveScore(distanceMi: number, p: Proposal): number {
  const params = {
    knee: milesToKm(p.kneeMi),
    kneeScore: p.kneeScore,
    decay: milesToKm(p.decayMi),
    cap: milesToKm(p.capMi),
  };
  return kneeCap.scoreKm(milesToKm(distanceMi), params) * 100;
}

/** Distance score 0-100 under the proposal, as a candidate would see it. */
export const distanceScore = (distanceMi: number, p: Proposal): number =>
  Math.round(curveScore(distanceMi, p));

export function zoneOf(distanceMi: number | null, p: Proposal): Zone {
  if (distanceMi == null) return "unknown";
  if (distanceMi <= p.kneeMi) return "commute";
  if (distanceMi < p.capMi) return "fall";
  return "beyond";
}

export function placeCandidate(c: Candidate, p: Proposal): Placement {
  const zone = zoneOf(c.distanceMi, p);
  if (c.distanceMi == null) {
    return {
      candidate: c,
      score: 0,
      shown: true,
      zone,
      reason:
        c.origin === "applied"
          ? "Applied, so always shown. No address yet, so distance scores 0 (pending decision)."
          : "No address yet: kept, and distance scores 0 (pending decision).",
    };
  }
  const score = distanceScore(c.distanceMi, p);
  const away = formatMiles(c.distanceMi);
  if (c.origin === "applied") {
    return {
      candidate: c,
      score,
      shown: true,
      zone,
      reason:
        zone === "beyond"
          ? `Applied, so shown even though they live ${away} away.`
          : "Applied, so always shown.",
    };
  }
  if (zone === "beyond") {
    return {
      candidate: c,
      score,
      shown: false,
      zone,
      reason: `AI match ${away} away: beyond the ${formatMiles(p.capMi)} cap, so not shown.`,
    };
  }
  return {
    candidate: c,
    score,
    shown: true,
    zone,
    reason:
      zone === "commute"
        ? "AI match within a normal commute."
        : `AI match past ${formatMiles(p.kneeMi)}: the distance score drops fast.`,
  };
}

export interface Board {
  shown: Placement[];
  unknown: Placement[];
  hidden: Placement[];
}

export function buildBoard(cast: Candidate[], p: Proposal): Board {
  const placed = cast.map((c) => placeCandidate(c, p));
  return {
    shown: placed
      .filter((x) => x.shown && x.zone !== "unknown")
      .sort((a, b) => b.score - a.score),
    unknown: placed.filter((x) => x.zone === "unknown"),
    hidden: placed
      .filter((x) => !x.shown)
      .sort((a, b) => (a.candidate.distanceMi ?? 0) - (b.candidate.distanceMi ?? 0)),
  };
}
