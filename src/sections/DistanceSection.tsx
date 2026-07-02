import { useMemo, useState } from "react";
import { FunctionSquare, RotateCcw, Sigma } from "lucide-react";
import { Card, Badge, Stat, SectionHeading } from "../components/ui/primitives";
import { Slider } from "../components/ui/Slider";
import { SegmentedToggle } from "../components/ui/SegmentedToggle";
import { DistanceChart, type ChartPoint } from "../components/DistanceChart";
import { distanceFunctions, getDistanceFunction } from "../lib/algorithms/distance";
import {
  fromKm,
  toKm,
  kmToMiles,
  unitShort,
  round,
  type Unit,
} from "../lib/units";

const EPS = 1e-6;
const SAMPLES = 500; // curve resolution

export function DistanceSection() {
  const [fnId, setFnId] = useState("sigmoid");
  const fn = getDistanceFunction(fnId);

  const [params, setParams] = useState<Record<string, number>>({ ...fn.defaults });
  const [unit, setUnit] = useState<Unit>("km");
  const [queryKm, setQueryKm] = useState(fn.defaults.d0 ?? 50);

  const selectFn = (id: string) => {
    const next = getDistanceFunction(id);
    setFnId(id);
    setParams({ ...next.defaults });
    setQueryKm(next.defaults.d0 ?? 50);
  };

  const reset = () => setParams({ ...fn.defaults });

  const isProd = (key: string) => Math.abs(params[key] - fn.defaults[key]) < EPS;
  const atProduction = fn.params.every((p) => isProd(p.key));

  // axis extends with d0 so the full S-curve always fits
  const maxKm = Math.max(100, (params.d0 ?? 50) * 2.6);
  const maxX = fromKm(maxKm, unit);

  const data = useMemo<ChartPoint[]>(() => {
    const pts: ChartPoint[] = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const xDisplay = (maxX * i) / SAMPLES;
      const dKm = toKm(xDisplay, unit);
      pts.push({ x: round(xDisplay, 4), score: fn.scoreKm(dKm, params) * 100 });
    }
    return pts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fnId, JSON.stringify(params), unit, maxX]);

  const midpointDisplay = fromKm(params.d0 ?? 50, unit);
  const d0Km = params.d0 ?? 50;

  // "test a distance" readout
  const queryDisplay = fromKm(queryKm, unit);
  const queryScore = fn.scoreKm(queryKm, params) * 100;

  // insight bands (function-agnostic, read off the curve)
  const comfortableKm = lastKmAtLeast(fn, params, maxKm, 90);
  const farKm = firstKmAtMost(fn, params, maxKm, 10);

  return (
    <div>
      <SectionHeading
        title="Distance scoring"
        subtitle="How commute distance turns into a match score. Move the parameters and watch the curve — defaults mirror production."
        right={
          <div className="flex items-center gap-2">
            {atProduction ? (
              <Badge tone="brand">● at production defaults</Badge>
            ) : (
              <Badge tone="muted">modified</Badge>
            )}
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-300 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
            >
              <RotateCcw size={14} /> Reset to production
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Controls */}
        <Card className="lg:col-span-5">
          <div className="space-y-5 p-5">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <FunctionSquare size={14} /> Function
              </div>
              <SegmentedToggle
                value={fnId}
                onChange={selectFn}
                options={distanceFunctions.map((f) => ({
                  value: f.id,
                  label: f.label,
                  disabled: f.status === "soon",
                }))}
              />
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {fn.description}
              </p>
            </div>

            <div className="h-px bg-white/5" />

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Units
              </span>
              <SegmentedToggle<Unit>
                size="sm"
                value={unit}
                onChange={setUnit}
                options={[
                  { value: "km", label: "km" },
                  { value: "mi", label: "miles" },
                ]}
              />
            </div>

            {fn.params.map((p) => {
              const isDist = p.kind === "distance";
              const value = isDist ? fromKm(params[p.key], unit) : params[p.key];
              const min = isDist ? fromKm(p.min, unit) : p.min;
              const max = isDist ? fromKm(p.max, unit) : p.max;
              const step = isDist ? (unit === "mi" ? 0.25 : p.step) : p.step;
              const dec = isDist ? 1 : 3;
              return (
                <Slider
                  key={p.key}
                  label={p.label}
                  value={round(value, dec)}
                  min={round(min, dec)}
                  max={round(max, dec)}
                  step={step}
                  decimals={dec}
                  suffix={isDist ? unitShort(unit) : p.suffix}
                  hint={p.hint}
                  isProduction={isProd(p.key)}
                  onChange={(v) =>
                    setParams((prev) => ({
                      ...prev,
                      [p.key]: isDist ? toKm(v, unit) : v,
                    }))
                  }
                />
              );
            })}
          </div>
        </Card>

        {/* Chart + stats */}
        <div className="space-y-5 lg:col-span-7">
          <Card>
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Sigma size={16} className="text-violet-300" />
                  {fn.label}
                </div>
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="inline-block h-2 w-4 rounded-full bg-gradient-to-r from-violet-400 to-violet-600" />
                  score
                </span>
              </div>
              <DistanceChart
                data={data}
                unit={unit}
                maxX={maxX}
                midpoint={midpointDisplay}
                query={{ x: queryDisplay, score: queryScore }}
              />
              <div className="mt-2 rounded-lg bg-black/20 px-3 py-2 text-center font-mono text-xs text-slate-400">
                {fn.formula}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat
              label="50% point (d₀)"
              value={`${round(d0Km, 1)} km`}
              sub={`${round(kmToMiles(d0Km), 1)} miles`}
              tone="accent"
            />
            <Stat
              label={`score @ ${round(queryDisplay, 1)} ${unitShort(unit)}`}
              value={`${queryScore.toFixed(1)}%`}
              tone="brand"
            />
            <Stat
              label="comfortable ≥90%"
              value={bandLabel(comfortableKm, unit, "within")}
            />
            <Stat label="too far ≤10%" value={bandLabel(farKm, unit, "beyond")} />
          </div>

          <Card>
            <div className="p-5">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Test a distance
              </div>
              <Slider
                label="Candidate distance"
                value={round(queryDisplay, 2)}
                min={0}
                max={round(maxX, 0)}
                step={0.1}
                decimals={2}
                suffix={unitShort(unit)}
                onChange={(v) => setQueryKm(toKm(v, unit))}
              />
              <p className="mt-3 text-sm text-slate-400">
                A candidate{" "}
                <span className="font-semibold text-slate-200">
                  {round(queryDisplay, 2)} {unitShort(unit)}
                </span>{" "}
                away scores{" "}
                <span className="font-semibold text-violet-300">
                  {queryScore.toFixed(2)}%
                </span>{" "}
                on distance.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── curve-band helpers (function-agnostic) ──────────────────────────────────
function lastKmAtLeast(
  fn: ReturnType<typeof getDistanceFunction>,
  params: Record<string, number>,
  maxKm: number,
  targetPct: number,
): number | null {
  const N = 2000;
  let last: number | null = null;
  for (let i = 0; i <= N; i++) {
    const dKm = (maxKm * i) / N;
    if (fn.scoreKm(dKm, params) * 100 >= targetPct) last = dKm;
    else break;
  }
  return last;
}

function firstKmAtMost(
  fn: ReturnType<typeof getDistanceFunction>,
  params: Record<string, number>,
  maxKm: number,
  targetPct: number,
): number | null {
  const N = 2000;
  for (let i = 0; i <= N; i++) {
    const dKm = (maxKm * i) / N;
    if (fn.scoreKm(dKm, params) * 100 <= targetPct) return dKm;
  }
  return null;
}

function bandLabel(km: number | null, unit: Unit, kind: "within" | "beyond"): string {
  if (km == null) return "—";
  const v = round(fromKm(km, unit), 1);
  return `${kind === "within" ? "≤" : "≥"} ${v} ${unitShort(unit)}`;
}
