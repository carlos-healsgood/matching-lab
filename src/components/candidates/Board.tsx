import { EyeOff, MapPinOff } from "lucide-react";
import { formatMiles, type Board as BoardData, type Placement } from "../../lib/candidates";
import { COLORS, initials, originLabel } from "./theme";

export function Board({
  board,
  hover,
  onHover,
}: {
  board: BoardData;
  hover: string | null;
  onHover: (id: string | null) => void;
}) {
  const empty = board.shown.length + board.unknown.length + board.hidden.length === 0;
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        {board.shown.map((pl, i) => (
          <Row key={pl.candidate.id} pl={pl} rank={i + 1} hover={hover} onHover={onHover} />
        ))}
      </div>

      {board.unknown.length > 0 && (
        <Group icon={<MapPinOff size={13} />} title="No address on file: shown, distance scored 0 (pending decision)">
          {board.unknown.map((pl) => (
            <Row key={pl.candidate.id} pl={pl} hover={hover} onHover={onHover} />
          ))}
        </Group>
      )}

      {board.hidden.length > 0 && (
        <Group icon={<EyeOff size={13} />} title="Not shown to the recruiter" tone="red">
          {board.hidden.map((pl) => (
            <Row key={pl.candidate.id} pl={pl} hover={hover} onHover={onHover} />
          ))}
        </Group>
      )}

      {empty && <p className="py-6 text-center text-sm text-slate-500">No candidates for this filter.</p>}
    </div>
  );
}

function Group({
  icon,
  title,
  tone = "muted",
  children,
}: {
  icon: React.ReactNode;
  title: string;
  tone?: "muted" | "red";
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div
        className={`flex items-center gap-1.5 px-1 pt-2 text-[11px] font-semibold uppercase tracking-wider ${
          tone === "red" ? "text-red-300/80" : "text-slate-500"
        }`}
      >
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({
  pl,
  rank,
  hover,
  onHover,
}: {
  pl: Placement;
  rank?: number;
  hover: string | null;
  onHover: (id: string | null) => void;
}) {
  const { candidate, score, shown, reason } = pl;
  const active = hover === candidate.id;
  const color = COLORS[candidate.origin];
  return (
    <div
      onMouseEnter={() => onHover(candidate.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onHover(candidate.id)}
      className={[
        "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ring-1 transition-all",
        active ? "bg-white/[0.07] ring-white/20" : "bg-white/[0.025] ring-white/5 hover:bg-white/[0.05]",
        shown ? "" : "opacity-70",
      ].join(" ")}
    >
      <div className="w-4 shrink-0 text-right text-xs tabular-nums text-slate-600">{rank ?? ""}</div>
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center text-xs font-semibold text-slate-950"
        style={{
          background: shown ? color : "transparent",
          border: shown ? "none" : `2px dashed ${COLORS.hidden}`,
          color: shown ? "#0b0f1a" : COLORS.hidden,
          borderRadius: candidate.origin === "applied" ? "9999px" : "10px",
        }}
      >
        {initials(candidate.name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="font-medium text-slate-100">{candidate.name}</span>
          <span
            className="rounded-full px-2 py-px text-[10.5px] font-medium"
            style={{ color, background: `${color}1a`, boxShadow: `inset 0 0 0 1px ${color}40` }}
          >
            {originLabel(candidate.origin)}
          </span>
          <span className="text-xs text-slate-500">
            {candidate.distanceMi == null ? "distance unknown" : formatMiles(candidate.distanceMi)}
          </span>
        </div>
        <div className={`truncate text-xs ${shown ? "text-slate-500" : "text-red-300/80"}`} title={reason}>
          {active || !shown ? reason : candidate.note}
        </div>
      </div>
      <ScoreBar score={score} shown={shown} color={color} />
    </div>
  );
}

function ScoreBar({ score, shown, color }: { score: number; shown: boolean; color: string }) {
  if (!shown) return <span className="w-24 shrink-0 text-right text-xs font-medium text-red-300">not shown</span>;
  return (
    <div className="flex w-24 shrink-0 items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="w-7 text-right text-sm font-semibold tabular-nums text-slate-100">{score}</span>
    </div>
  );
}
