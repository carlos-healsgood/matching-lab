import { useMemo, useState } from "react";
import { ChevronDown, Info, RotateCcw, Users } from "lucide-react";
import { Badge, Card, SectionHeading, Stat } from "../components/ui/primitives";
import { Slider } from "../components/ui/Slider";
import { SegmentedToggle } from "../components/ui/SegmentedToggle";
import { RulesStrip } from "../components/candidates/RulesStrip";
import { CandidatesChart } from "../components/candidates/CandidatesChart";
import { Board } from "../components/candidates/Board";
import { Chip } from "../components/candidates/Lanes";
import { TryCandidate } from "../components/candidates/TryCandidate";
import { COLORS } from "../components/candidates/theme";
import {
  CAST,
  PROPOSAL,
  VACANCY,
  buildBoard,
  formatMiles,
  placeCandidate,
  type Origin,
  type Proposal,
} from "../lib/candidates";

type Filter = "all" | Origin;

export function WhoShowsUpSection() {
  const [proposal, setProposal] = useState<Proposal>(PROPOSAL);
  const [filter, setFilter] = useState<Filter>("all");
  const [hover, setHover] = useState<string | null>(null);
  const [tryOrigin, setTryOrigin] = useState<Origin>("ai");
  const [tryMi, setTryMi] = useState(100);
  const [tuning, setTuning] = useState(false);

  const atProposal = JSON.stringify(proposal) === JSON.stringify(PROPOSAL);
  const xMax = Math.max(300, Math.ceil((proposal.capMi + 40) / 50) * 50);

  const cast = useMemo(
    () => CAST.filter((c) => filter === "all" || c.origin === filter),
    [filter],
  );
  const board = useMemo(() => buildBoard(cast, proposal), [cast, proposal]);
  const all = useMemo(() => buildBoard(CAST, proposal), [proposal]);
  const placed = useMemo(() => cast.map((c) => placeCandidate(c, proposal)), [cast, proposal]);
  const onChart = placed.filter((pl) => pl.candidate.distanceMi != null && pl.candidate.distanceMi <= xMax);
  const further = placed
    .filter((pl) => pl.candidate.distanceMi != null && pl.candidate.distanceMi > xMax)
    .sort((a, b) => (a.candidate.distanceMi ?? 0) - (b.candidate.distanceMi ?? 0));
  const noAddress = placed.filter((pl) => pl.candidate.distanceMi == null);

  const tryPlacement = placeCandidate(
    { id: "try", name: "Your candidate", origin: tryOrigin, distanceMi: tryMi, note: "" },
    proposal,
  );

  const applied = all.shown.concat(all.unknown).filter((p) => p.candidate.origin === "applied").length;
  const aiShown = all.shown.concat(all.unknown).filter((p) => p.candidate.origin === "ai").length;
  const hovered = placed.find((pl) => pl.candidate.id === hover);

  const set = (patch: Partial<Proposal>) =>
    setProposal((p) => {
      const next = { ...p, ...patch };
      next.capMi = Math.max(next.capMi, next.kneeMi + 20);
      return next;
    });

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Who shows up on a vacancy"
        subtitle="How distance decides which candidates a recruiter sees, and how high they rank. Invented candidates, proposed rules."
        right={atProposal ? <Badge tone="brand">● proposal for approval</Badge> : <Badge tone="muted">modified</Badge>}
      />

      <RulesStrip proposal={proposal} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="On the board" value={all.shown.length + all.unknown.length} sub={`of ${CAST.length} candidates`} />
        <Stat label="Applied" value={<span style={{ color: COLORS.applied }}>{applied}</span>} sub="all of them shown" />
        <Stat label="AI matches shown" value={<span style={{ color: COLORS.ai }}>{aiShown}</span>} sub={`within ${formatMiles(proposal.capMi)} or no address`} />
        <Stat label="Not shown" value={<span style={{ color: COLORS.hidden }}>{all.hidden.length}</span>} sub={`AI matches beyond ${formatMiles(proposal.capMi)}`} />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-white/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-violet-500/15 p-1.5 ring-1 ring-violet-500/25">
              <Users size={16} className="text-violet-300" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">Where each candidate lands</div>
              <div className="text-xs text-slate-500">Vacancy: {VACANCY}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Legend />
            <SegmentedToggle<Filter>
              size="sm"
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "All" },
                { value: "applied", label: "Applied" },
                { value: "ai", label: "AI match" },
              ]}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 p-5 lg:flex-row">
          <div className="min-w-0 flex-1">
            <CandidatesChart
              proposal={proposal}
              placements={onChart}
              tryPlacement={tryMi <= xMax ? tryPlacement : null}
              xMax={xMax}
              hover={hover}
              onHover={setHover}
            />
          </div>
          <div className="flex w-full flex-col gap-4 lg:w-56">
            <Lane title={`Further than ${formatMiles(xMax)}`} hint="Off the chart to the right.">
              {further.map((pl) => (
                <Chip key={pl.candidate.id} pl={pl} hover={hover} onHover={setHover} />
              ))}
            </Lane>
            <Lane title="No address on file" hint="Kept, but distance cannot be scored.">
              {noAddress.map((pl) => (
                <Chip key={pl.candidate.id} pl={pl} hover={hover} onHover={setHover} />
              ))}
            </Lane>
          </div>
        </div>

        <div className="flex min-h-[52px] items-center gap-2.5 border-t border-white/5 px-5 py-3 text-sm">
          <Info size={15} className="shrink-0 text-slate-500" />
          {hovered ? (
            <span className="text-slate-300">
              <span className="font-semibold text-slate-100">{hovered.candidate.name}</span>
              {": "}
              {hovered.reason}
            </span>
          ) : (
            <span className="text-slate-500">Point at any candidate, on the chart or on the board, to see why they land there.</span>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <div className="p-5">
            <div className="mb-1 text-sm font-semibold text-slate-100">The recruiter's board</div>
            <p className="mb-4 text-xs text-slate-500">
              What the recruiter sees for this vacancy, best distance score first.
            </p>
            <Board board={board} hover={hover} onHover={setHover} />
          </div>
        </Card>

        <div className="space-y-6 self-start lg:sticky lg:top-6 lg:col-span-5">
          <Card>
            <div className="p-5">
              <TryCandidate
                origin={tryOrigin}
                distanceMi={tryMi}
                placement={tryPlacement}
                onOrigin={setTryOrigin}
                onDistance={setTryMi}
              />
            </div>
          </Card>

          <Card>
            <button
              onClick={() => setTuning((t) => !t)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span className="text-sm font-semibold text-slate-200">Try other values</span>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${tuning ? "rotate-180" : ""}`} />
            </button>
            {tuning && (
              <div className="space-y-5 border-t border-white/5 p-5">
                <Slider
                  label="Normal commute up to"
                  value={proposal.kneeMi}
                  min={20}
                  max={120}
                  step={5}
                  decimals={0}
                  suffix="mi"
                  isProduction={proposal.kneeMi === PROPOSAL.kneeMi}
                  defaultLabel="proposed"
                  onChange={(v) => set({ kneeMi: v })}
                />
                <Slider
                  label="AI matches not shown beyond"
                  value={proposal.capMi}
                  min={100}
                  max={500}
                  step={10}
                  decimals={0}
                  suffix="mi"
                  isProduction={proposal.capMi === PROPOSAL.capMi}
                  defaultLabel="proposed"
                  onChange={(v) => set({ capMi: v })}
                />
                <button
                  onClick={() => setProposal(PROPOSAL)}
                  disabled={atProposal}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-300 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                >
                  <RotateCcw size={14} /> Back to the proposal
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-slate-500">
        The score here is the <span className="text-slate-400">distance part</span> of a match, from 0 to 100. The
        overall match also weighs role, skills, availability and pay. The vacancy and every candidate on this page are
        invented.
      </p>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-3 text-[11px] text-slate-400">
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLORS.applied }} /> Applied
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rotate-45 rounded-[2px]" style={{ background: COLORS.ai }} /> AI match
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rotate-45 rounded-[2px]" style={{ border: `1.5px dashed ${COLORS.hidden}` }} /> Not shown
      </span>
    </div>
  );
}

function Lane({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</div>
      <div className="mb-2 text-[11px] text-slate-600">{hint}</div>
      <div className="flex flex-col gap-1.5">
        {items.length ? children : <span className="text-xs text-slate-600">None for this filter.</span>}
      </div>
    </div>
  );
}
