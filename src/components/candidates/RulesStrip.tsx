import { EyeOff, TrendingDown, UserCheck, type LucideIcon } from "lucide-react";
import { formatMiles, type Proposal } from "../../lib/candidates";

function Rule({
  icon: Icon,
  tone,
  title,
  children,
}: {
  icon: LucideIcon;
  tone: "emerald" | "violet" | "red";
  title: string;
  children: React.ReactNode;
}) {
  const tones = {
    emerald: "from-emerald-500/15 text-emerald-300 ring-emerald-500/25",
    violet: "from-violet-500/15 text-violet-300 ring-violet-500/25",
    red: "from-red-500/15 text-red-300 ring-red-500/25",
  } as const;
  return (
    <div className="card flex gap-4 p-5">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br to-transparent ring-1 ${tones[tone]}`}
      >
        <Icon size={20} />
      </div>
      <div>
        <div className="font-semibold text-slate-100">{title}</div>
        <p className="mt-1 text-sm leading-relaxed text-slate-400">{children}</p>
      </div>
    </div>
  );
}

export function RulesStrip({ proposal }: { proposal: Proposal }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <Rule icon={UserCheck} tone="emerald" title="Applied? Always shown.">
        Anyone who applies to the vacancy appears on its board, wherever they live, even
        with no address on file.
      </Rule>
      <Rule icon={TrendingDown} tone="violet" title="Distance lowers the AI score">
        The score falls steadily to {Math.round(proposal.kneeScore * 100)} over a normal commute, up
        to {formatMiles(proposal.kneeMi)}, then drops hard, fading to 0 at {formatMiles(proposal.capMi)}.
      </Rule>
      <Rule icon={EyeOff} tone="red" title={`AI matches beyond ${formatMiles(proposal.capMi)} are not shown`}>
        Too far to be a real option, so AI does not suggest them. People who applied are
        never affected.
      </Rule>
    </div>
  );
}
