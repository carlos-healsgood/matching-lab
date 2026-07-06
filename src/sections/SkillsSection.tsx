import { useState } from "react";
import { Check, RotateCcw, Sparkles, X } from "lucide-react";
import { Card, Badge, Stat, SectionHeading } from "../components/ui/primitives";
import { MASTER_SKILLS, skillsBreakdown } from "../lib/algorithms/skills";

const DEFAULT_REQUIRED = [
  "IV cannulation",
  "Medication administration",
  "Phlebotomy",
  "Wound care",
];
const DEFAULT_CANDIDATE = [
  "IV cannulation",
  "Medication administration",
  "Care planning",
  "Patient assessment",
];

export function SkillsSection() {
  const [required, setRequired] = useState<string[]>(DEFAULT_REQUIRED);
  const [candidate, setCandidate] = useState<string[]>(DEFAULT_CANDIDATE);

  const toggle = (
    list: string[],
    set: (v: string[]) => void,
    skill: string,
  ) =>
    set(list.includes(skill) ? list.filter((s) => s !== skill) : [...list, skill]);

  const reset = () => {
    setRequired(DEFAULT_REQUIRED);
    setCandidate(DEFAULT_CANDIDATE);
  };
  const atDefault =
    JSON.stringify([...required].sort()) === JSON.stringify([...DEFAULT_REQUIRED].sort()) &&
    JSON.stringify([...candidate].sort()) === JSON.stringify([...DEFAULT_CANDIDATE].sort());

  const bd = skillsBreakdown(required, candidate);
  const score = bd.score * 100;
  const noReq = required.length === 0;

  return (
    <div>
      <SectionHeading
        title="Skills scoring"
        subtitle="Exact set-overlap: the share of the job's required skills that the candidate actually has."
        right={
          <div className="flex items-center gap-2">
            {atDefault ? <Badge tone="brand">● example</Badge> : <Badge tone="muted">modified</Badge>}
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-300 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        }
      />

      <Card className="mb-5">
        <p className="p-4 text-sm leading-relaxed text-slate-400">
          <span className="font-mono text-slate-300">score = |required ∩ candidate| / |required|</span>
          {" — "}the fraction of the job's <strong>required</strong> skills the candidate holds.
          Extra skills the candidate has beyond what's required <strong>don't</strong> add or
          subtract. If the job requires <strong>no</strong> skills, everyone scores a neutral{" "}
          <strong>100%</strong>. Both lists draw from one shared skill vocabulary (in production,
          matched by skill ID / normalised name).
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Selectors */}
        <div className="space-y-5 lg:col-span-7">
          <SkillPicker
            title="Job requires"
            hint="Pick the skills this vacancy demands."
            selected={required}
            onToggle={(s) => toggle(required, setRequired, s)}
            tone="violet"
          />
          <SkillPicker
            title="Candidate has"
            hint="Pick the skills this candidate holds."
            selected={candidate}
            onToggle={(s) => toggle(candidate, setCandidate, s)}
            tone="cyan"
          />
        </div>

        {/* Result */}
        <div className="space-y-5 lg:col-span-5">
          <Card>
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Sparkles size={16} className="text-violet-300" /> Overlap score
              </div>
              <div className="flex items-end gap-3">
                <div className="text-5xl font-bold tabular-nums text-violet-300">
                  {score.toFixed(0)}%
                </div>
                <div className="mb-1 text-sm text-slate-400">
                  {noReq ? "no skills required → neutral" : `${bd.matched.length} of ${required.length} required covered`}
                </div>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-400 to-violet-600 transition-all"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Stat label="required" value={required.length} tone="accent" />
            <Stat label="matched" value={bd.matched.length} tone="brand" />
            <Stat label="missing" value={bd.missing.length} />
          </div>

          <Card>
            <div className="space-y-3 p-5">
              <SkillList title="Matched" skills={bd.matched} icon="check" empty="none yet" />
              <SkillList title="Missing (required, not held)" skills={bd.missing} icon="x" empty="none — full coverage" />
              <SkillList title="Extra (held, not required → ignored)" skills={bd.extra} icon="dot" empty="none" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SkillPicker({
  title,
  hint,
  selected,
  onToggle,
  tone,
}: {
  title: string;
  hint: string;
  selected: string[];
  onToggle: (s: string) => void;
  tone: "violet" | "cyan";
}) {
  const on =
    tone === "violet"
      ? "bg-violet-500 text-white ring-violet-400"
      : "bg-cyan-500/90 text-white ring-cyan-400";
  return (
    <Card>
      <div className="p-5">
        <div className="mb-1 text-sm font-medium text-slate-200">{title}</div>
        <div className="mb-3 text-xs text-slate-500">{hint}</div>
        <div className="flex flex-wrap gap-2">
          {MASTER_SKILLS.map((s) => {
            const active = selected.includes(s);
            return (
              <button
                key={s}
                onClick={() => onToggle(s)}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-all",
                  active
                    ? on
                    : "bg-white/5 text-slate-400 ring-white/10 hover:bg-white/10 hover:text-slate-200",
                ].join(" ")}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function SkillList({
  title,
  skills,
  icon,
  empty,
}: {
  title: string;
  skills: string[];
  icon: "check" | "x" | "dot";
  empty: string;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </div>
      {skills.length === 0 ? (
        <div className="text-xs text-slate-600">{empty}</div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {skills.map((s) => (
            <span
              key={s}
              className={[
                "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs",
                icon === "check"
                  ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20"
                  : icon === "x"
                    ? "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20"
                    : "bg-white/5 text-slate-500 ring-1 ring-white/10",
              ].join(" ")}
            >
              {icon === "check" && <Check size={12} />}
              {icon === "x" && <X size={12} />}
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
