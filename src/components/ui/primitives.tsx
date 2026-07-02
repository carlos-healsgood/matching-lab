import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function Badge({
  children,
  tone = "brand",
}: {
  children: ReactNode;
  tone?: "brand" | "muted" | "soon" | "accent";
}) {
  const tones: Record<string, string> = {
    brand: "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30",
    accent: "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/30",
    muted: "bg-white/5 text-slate-400 ring-1 ring-white/10",
    soon: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Stat({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "default" | "brand" | "accent";
}) {
  const valueTone =
    tone === "brand"
      ? "text-violet-300"
      : tone === "accent"
        ? "text-cyan-300"
        : "text-slate-100";
  return (
    <div className="rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/5">
      <div className="text-[11px] uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${valueTone}`}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

export function SectionHeading({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
