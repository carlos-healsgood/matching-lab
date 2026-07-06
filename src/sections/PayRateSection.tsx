import { useMemo, useState } from "react";
import { RotateCcw, Coins } from "lucide-react";
import { Card, Badge, Stat, SectionHeading } from "../components/ui/primitives";
import { Slider } from "../components/ui/Slider";
import { ScoreChart, type Pt } from "../components/ScoreChart";
import { payScore, PAY_DEFAULTS } from "../lib/algorithms/payrate";
import { round } from "../lib/units";

const SAMPLES = 500;

export function PayRateSection() {
  const [jobPay, setJobPay] = useState(PAY_DEFAULTS.jobPay);
  const [hp, setHp] = useState(PAY_DEFAULTS.hp);
  const [candidatePay, setCandidatePay] = useState(30);

  const atProduction =
    Math.abs(jobPay - PAY_DEFAULTS.jobPay) < 1e-9 &&
    Math.abs(hp - PAY_DEFAULTS.hp) < 1e-9;
  const reset = () => {
    setJobPay(PAY_DEFAULTS.jobPay);
    setHp(PAY_DEFAULTS.hp);
  };

  const maxX = Math.max(30, jobPay * 3);

  const data = useMemo<Pt[]>(() => {
    const pts: Pt[] = [];
    // start above 0 so the flat plateau reads cleanly (pay = 0 is the separate
    // "no stated pay" case, surfaced below rather than as a spike on the curve).
    for (let i = 1; i <= SAMPLES; i++) {
      const x = (maxX * i) / SAMPLES;
      pts.push({ x: round(x, 3), score: payScore(x, jobPay, hp) * 100 });
    }
    return pts;
  }, [jobPay, hp, maxX]);

  const half = jobPay * Math.pow(2, 1 / hp); // where (jobPay/cpay)^hp = 0.5
  const twoX = payScore(2 * jobPay, jobPay, hp) * 100;
  const candScore = payScore(candidatePay, jobPay, hp) * 100;

  return (
    <div>
      <SectionHeading
        title="Pay-rate scoring"
        subtitle="How a candidate's expected pay compares to the job's budget. One-sided: cheaper is never penalised; over-budget declines softly."
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
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <div className="space-y-5 p-5">
            <p className="text-sm leading-relaxed text-slate-400">
              A candidate at or under budget scores <strong>100%</strong>. Over
              budget the score decays as{" "}
              <span className="font-mono text-slate-300">(budget / pay)^hp</span> —
              softly, asymptotic to 0 but never exactly 0. A candidate with{" "}
              <strong>no stated pay → 0</strong>.
            </p>

            <div className="h-px bg-white/5" />

            <Slider
              label="Job budget (pay rate)"
              value={round(jobPay, 1)}
              min={5}
              max={100}
              step={1}
              decimals={1}
              suffix="/hr"
              hint="The vacancy's pay rate — the break-point."
              isProduction={Math.abs(jobPay - PAY_DEFAULTS.jobPay) < 1e-9}
              onChange={setJobPay}
            />
            <Slider
              label="Softness exponent (hp)"
              value={round(hp, 2)}
              min={1}
              max={3}
              step={0.1}
              decimals={2}
              hint="Higher hp = steeper penalty over budget (prod = 1.7)."
              isProduction={Math.abs(hp - PAY_DEFAULTS.hp) < 1e-9}
              onChange={setHp}
            />
          </div>
        </Card>

        <div className="space-y-5 lg:col-span-7">
          <Card>
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Coins size={16} className="text-violet-300" />
                  Soft over-budget curve
                </div>
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="inline-block h-2 w-4 rounded-full bg-gradient-to-r from-violet-400 to-violet-600" />
                  score
                </span>
              </div>
              <ScoreChart
                data={data}
                xLabel="candidate pay rate (/hr)"
                maxX={maxX}
                unitSuffix="/hr"
                markers={[{ x: jobPay, label: "budget", color: "#22d3ee" }]}
                query={{ x: Math.min(candidatePay, maxX), score: candScore }}
              />
              <div className="mt-2 rounded-lg bg-black/20 px-3 py-2 text-center font-mono text-xs text-slate-400">
                score = candidate ≤ budget ? 100% : (budget / candidate)^hp
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="full score" value={`≤ ${round(jobPay, 0)}`} sub="at/under budget" tone="accent" />
            <Stat label="50% at" value={round(half, 1)} sub={`${round(half / jobPay, 2)}× budget`} tone="brand" />
            <Stat label="at 2× budget" value={`${twoX.toFixed(1)}%`} />
            <Stat label="no stated pay" value="0%" sub="separate case" />
          </div>

          <Card>
            <div className="p-5">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Test a candidate
              </div>
              <Slider
                label="Candidate pay rate"
                value={round(candidatePay, 1)}
                min={0}
                max={round(maxX, 0)}
                step={0.5}
                decimals={1}
                suffix="/hr"
                onChange={setCandidatePay}
              />
              <p className="mt-3 text-sm text-slate-400">
                Budget <span className="font-semibold text-slate-200">{round(jobPay, 0)}</span>,
                candidate asks{" "}
                <span className="font-semibold text-slate-200">{round(candidatePay, 1)}</span> →{" "}
                <span className="font-semibold text-violet-300">{candScore.toFixed(1)}%</span>
                {candidatePay > jobPay
                  ? ` (${round(candidatePay / jobPay, 2)}× over budget)`
                  : candidatePay > 0
                    ? " (within budget)"
                    : " (no stated pay)"}
                .
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
