import type { Origin } from "../../lib/candidates";

export const COLORS = {
  applied: "#34d399",
  ai: "#a78bfa",
  hidden: "#f87171",
  commute: "#34d399",
  fall: "#fbbf24",
  beyond: "#f87171",
  try: "#fbbf24",
} as const;

export const originLabel = (o: Origin): string => (o === "applied" ? "Applied" : "AI match");

export const initials = (name: string): string =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .replace(/\./g, "")
    .slice(0, 2)
    .toUpperCase();
