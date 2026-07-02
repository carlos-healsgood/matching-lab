import { FlaskConical } from "lucide-react";
import { sections } from "../sections";
import { Badge } from "./ui/primitives";

export function Sidebar({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="flex w-64 shrink-0 flex-col gap-6 border-r border-white/5 bg-white/[0.02] p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 p-2 shadow-lg shadow-violet-900/40">
          <FlaskConical size={20} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-100">Matching Lab</div>
          <div className="text-[11px] text-slate-500">Healsgood AI</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Algorithms
        </div>
        {sections.map((s) => {
          const Icon = s.icon;
          const isActive = s.id === active;
          const disabled = s.status === "soon";
          return (
            <button
              key={s.id}
              disabled={disabled}
              onClick={() => onSelect(s.id)}
              className={[
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                isActive
                  ? "bg-violet-500/15 ring-1 ring-violet-500/30"
                  : disabled
                    ? "cursor-not-allowed opacity-55"
                    : "hover:bg-white/5",
              ].join(" ")}
            >
              <Icon
                size={18}
                className={isActive ? "text-violet-300" : "text-slate-400"}
              />
              <div className="min-w-0 flex-1">
                <div
                  className={`text-sm font-medium ${isActive ? "text-slate-100" : "text-slate-300"}`}
                >
                  {s.label}
                </div>
                <div className="truncate text-[11px] text-slate-500">
                  {s.blurb}
                </div>
              </div>
              {s.status === "soon" && <Badge tone="soon">soon</Badge>}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl bg-white/[0.03] p-3 text-[11px] leading-relaxed text-slate-500 ring-1 ring-white/5">
        Tweak parameters to explore. Defaults mirror{" "}
        <span className="text-emerald-400/80">production</span>. Nothing here
        affects the live system.
      </div>
    </aside>
  );
}
