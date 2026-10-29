import { formatMiles, type Placement } from "../../lib/candidates";
import { COLORS, originLabel } from "./theme";

export function Chip({
  pl,
  hover,
  onHover,
}: {
  pl: Placement;
  hover: string | null;
  onHover: (id: string | null) => void;
}) {
  const { candidate, shown } = pl;
  const color = shown ? COLORS[candidate.origin] : COLORS.hidden;
  const active = hover === candidate.id;
  return (
    <div
      onMouseEnter={() => onHover(candidate.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onHover(candidate.id)}
      className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 ring-1 transition-all ${
        active ? "bg-white/[0.08] ring-white/25" : "bg-white/[0.03] ring-white/10 hover:bg-white/[0.06]"
      }`}
    >
      <span
        className="inline-block h-3 w-3 shrink-0"
        style={{
          background: shown ? color : "transparent",
          border: shown ? "none" : `2px dashed ${color}`,
          borderRadius: candidate.origin === "applied" ? "9999px" : "2px",
          transform: candidate.origin === "applied" ? undefined : "rotate(45deg)",
        }}
      />
      <div className="min-w-0 leading-tight">
        <div className="text-sm font-medium text-slate-200">{candidate.name}</div>
        <div className="text-[11px] text-slate-500">
          {originLabel(candidate.origin)}
          {candidate.distanceMi != null && <> · {formatMiles(candidate.distanceMi)}</>}
        </div>
      </div>
      <span className={`ml-auto pl-2 text-[11px] font-semibold ${shown ? "text-emerald-300" : "text-red-300"}`}>
        {shown ? "shown" : "hidden"}
      </span>
    </div>
  );
}
