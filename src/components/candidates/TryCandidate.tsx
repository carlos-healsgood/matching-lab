import { Star } from "lucide-react";
import { formatMiles, type Origin, type Placement } from "../../lib/candidates";
import { Slider } from "../ui/Slider";
import { SegmentedToggle } from "../ui/SegmentedToggle";

export function TryCandidate({
  origin,
  distanceMi,
  placement,
  onOrigin,
  onDistance,
}: {
  origin: Origin;
  distanceMi: number;
  placement: Placement;
  onOrigin: (o: Origin) => void;
  onDistance: (mi: number) => void;
}) {
  const { shown, score } = placement;
  const who = origin === "applied" ? "A candidate who applied" : "An AI match";
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Star size={15} className="text-amber-300" fill="currentColor" />
          Try a candidate
        </div>
        <SegmentedToggle<Origin>
          size="sm"
          value={origin}
          onChange={onOrigin}
          options={[
            { value: "ai", label: "AI match" },
            { value: "applied", label: "Applied" },
          ]}
        />
      </div>
      <Slider
        label="Lives this far from the vacancy"
        value={distanceMi}
        min={0}
        max={600}
        step={5}
        decimals={0}
        suffix="mi"
        onChange={onDistance}
      />
      <div
        className={`flex items-center gap-4 rounded-xl p-4 ring-1 ${
          shown ? "bg-emerald-500/[0.06] ring-emerald-500/20" : "bg-red-500/[0.07] ring-red-500/25"
        }`}
      >
        <div className="text-center">
          <div className={`text-3xl font-bold tabular-nums ${shown ? "text-slate-50" : "text-red-300"}`}>
            {shown ? score : "—"}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">score</div>
        </div>
        <p className="text-sm leading-relaxed text-slate-300">
          {who} <span className="font-semibold text-slate-100">{formatMiles(distanceMi)}</span> away{" "}
          {shown ? (
            <>
              is <span className="font-semibold text-emerald-300">shown</span>
              {placement.zone === "beyond" ? " because they applied" : ""}, with a distance score of{" "}
              <span className="font-semibold text-slate-100">{score}</span>.
            </>
          ) : (
            <>
              is <span className="font-semibold text-red-300">not shown</span>: beyond the cap.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
