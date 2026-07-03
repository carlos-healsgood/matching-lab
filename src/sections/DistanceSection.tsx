import { useMemo, useState } from "react";
import { RotateCcw, Sigma, Star } from "lucide-react";
import { Card, Badge, Stat, SectionHeading } from "../components/ui/primitives";
import { Slider } from "../components/ui/Slider";
import { SegmentedToggle } from "../components/ui/SegmentedToggle";
import { BandsEditor } from "../components/ui/BandsEditor";
import { DistanceChart, type ChartPoint } from "../components/DistanceChart";
import {
  distanceFunctions,
  getDistanceFunction,
  type Band,
  type DistanceFunction,
  type ParamValue,
} from "../lib/algorithms/distance";
import { fromKm, toKm, kmToMiles, unitShort, round, type Unit } from "../lib/units";

const SAMPLES = 500; // curve resolution
type Params = Record<string, ParamValue>;

const clone = (d: Params): Params => JSON.parse(JSON.stringify(d));
const num = (v: ParamValue | undefined) => (typeof v === "number" ? v : 0);

export function DistanceSection() {
  const [fnId, setFnId] = useState("sigmoid");
  const fn = getDistanceFunction(fnId);

  const [params, setParams] = useState<Params>(() => clone(fn.defaults));
  const [unit, setUnit] = useState<Unit>("km");
  const [queryKm, setQueryKm] = useState(30);

  const selectFn = (id: string) => {
    setFnId(id);
    setParams(clone(getDistanceFunction(id).defaults));
  };
  const reset = () => setParams(clone(fn.defaults));

  const score = (dKm: number) => fn.scoreKm(dKm, params) * 100;

  const isProd = (key: string) =>
    JSON.stringify(params[key]) === JSON.stringify(fn.defaults[key]);
  const atProduction = fn.params.every((p) => isProd(p.key));

  const maxKm = computeMaxKm(fn, params);
  const maxX = fromKm(maxKm, unit);

  const data = useMemo<ChartPoint[]>(() => {
    const pts: ChartPoint[] = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const xDisplay = (maxX * i) / SAMPLES;
      pts.push({ x: round(xDisplay, 4), score: fn.scoreKm(toKm(xDisplay, unit), params) * 100 });
    }
    return pts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fnId, JSON.stringify(params), unit, maxX]);

  const halfKm = crossKm(fn, params, 0.5, maxKm);
  const comfortableKm = lastKmAtLeast(fn, params, maxKm, 90);
  const farKm = firstKmAtMost(fn, params, maxKm, 10);

  const queryDisplay = Math.min(fromKm(queryKm, unit), maxX);
  const queryScore = score(toKm(queryDisplay, unit));

  return (
    <div>
      <SectionHeading
        title="Distance scoring"
        subtitle="How commute distance turns into a match score. Pick a function, move its parameters and watch the curve."
        right={
          <div className="flex items-center gap-2">
            {atProduction ? (
              <Badge tone="brand">● defaults</Badge>
            ) : (
              <Badge tone="muted">modified</Badge>
            )}
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-300 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        }
      />

      {/* Function selector (wraps to fit all functions) */}
      <div className="mb-5 flex flex-wrap gap-2">
        {distanceFunctions.map((f) => {
          const active = f.id === fnId;
          return (
            <button
              key={f.id}
              onClick={() => selectFn(f.id)}
              className={[
                "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all",
                active
                  ? "bg-violet-500 text-white shadow-[0_2px_12px_-2px_rgba(124,58,237,0.7)]"
                  : "bg-white/5 text-slate-300 ring-1 ring-white/10 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              {f.recommended && (
                <Star size={13} className={active ? "text-amber-200" : "text-amber-400"} fill="currentColor" />
              )}
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Controls */}
        <Card className="lg:col-span-5">
          <div className="space-y-5 p-5">
            <p className="text-sm leading-relaxed text-slate-400">{fn.description}</p>

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
              if (p.kind === "bands") {
                return (
                  <div key={p.key} className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-medium text-slate-300">
                        {p.label}
                        {isProd(p.key) && (
                          <span className="ml-2 align-middle text-[10px] uppercase tracking-wider text-emerald-400/80">
                            ● default
                          </span>
                        )}
                      </span>
                    </div>
                    {p.hint && <p className="text-xs text-slate-500">{p.hint}</p>}
                    <BandsEditor
                      value={params[p.key] as Band[]}
                      unit={unit}
                      onChange={(bands) =>
                        setParams((prev) => ({ ...prev, [p.key]: bands }))
                      }
                    />
                  </div>
                );
              }
              const isDist = p.kind === "distance";
              const raw = num(params[p.key]);
              const value = isDist ? fromKm(raw, unit) : raw;
              const min = isDist ? fromKm(p.min ?? 0, unit) : (p.min ?? 0);
              const max = isDist ? fromKm(p.max ?? 1, unit) : (p.max ?? 1);
              const step = isDist ? (unit === "mi" ? 0.25 : (p.step ?? 1)) : (p.step ?? 1);
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
                  {fn.recommended && <Badge tone="brand">recommended</Badge>}
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
                midpoint={halfKm != null ? fromKm(halfKm, unit) : null}
                query={{ x: queryDisplay, score: queryScore }}
              />
              <div className="mt-2 rounded-lg bg-black/20 px-3 py-2 text-center font-mono text-xs text-slate-400">
                {fn.formula}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat
              label="50% point"
              value={halfKm != null ? `${round(fromKm(halfKm, unit), 1)} ${unitShort(unit)}` : "—"}
              sub={halfKm != null ? `${round(halfKm, 1)} km / ${round(kmToMiles(halfKm), 1)} mi` : undefined}
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

// ── curve helpers (function-agnostic; scan the real scoreKm) ────────────────
function computeMaxKm(fn: DistanceFunction, params: Params): number {
  const scanMax = 250;
  const N = 500;
  let below: number | null = null;
  for (let i = 0; i <= N; i++) {
    const d = (scanMax * i) / N;
    if (fn.scoreKm(d, params) <= 0.02) {
      below = d;
      break;
    }
  }
  const base = below ?? scanMax;
  const nice = Math.ceil((base * 1.15) / 10) * 10;
  return Math.min(250, Math.max(60, nice));
}

function crossKm(
  fn: DistanceFunction,
  params: Params,
  target: number,
  maxKm: number,
): number | null {
  const N = 4000;
  let prev = fn.scoreKm(0, params);
  for (let i = 1; i <= N; i++) {
    const d = (maxKm * i) / N;
    const s = fn.scoreKm(d, params);
    if (prev >= target && s < target) return d;
    prev = s;
  }
  return null;
}

function lastKmAtLeast(
  fn: DistanceFunction,
  params: Params,
  maxKm: number,
  targetPct: number,
): number | null {
  const N = 2000;
  let last: number | null = null;
  for (let i = 0; i <= N; i++) {
    const d = (maxKm * i) / N;
    if (fn.scoreKm(d, params) * 100 >= targetPct) last = d;
    else break;
  }
  return last;
}

function firstKmAtMost(
  fn: DistanceFunction,
  params: Params,
  maxKm: number,
  targetPct: number,
): number | null {
  const N = 2000;
  for (let i = 0; i <= N; i++) {
    const d = (maxKm * i) / N;
    if (fn.scoreKm(d, params) * 100 <= targetPct) return d;
  }
  return null;
}

function bandLabel(km: number | null, unit: Unit, kind: "within" | "beyond"): string {
  if (km == null) return "—";
  const v = round(fromKm(km, unit), 1);
  return `${kind === "within" ? "≤" : "≥"} ${v} ${unitShort(unit)}`;
}
