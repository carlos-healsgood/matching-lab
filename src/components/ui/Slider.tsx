import type { CSSProperties } from "react";

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix,
  hint,
  decimals = 2,
  isProduction,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
  hint?: string;
  decimals?: number;
  isProduction?: boolean;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const style = { "--pct": `${pct}%` } as CSSProperties;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-sm font-medium text-slate-300">
          {label}
          {isProduction && (
            <span className="ml-2 align-middle text-[10px] uppercase tracking-wider text-emerald-400/80">
              ● prod
            </span>
          )}
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!Number.isNaN(v)) onChange(clamp(v, min, max));
            }}
            className="w-20 rounded-lg bg-white/5 px-2 py-1 text-right text-sm tabular-nums text-slate-100 ring-1 ring-white/10 outline-none focus:ring-violet-500/50"
          />
          {suffix && <span className="text-xs text-slate-500">{suffix}</span>}
        </div>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        style={style}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-[10px] text-slate-600 tabular-nums">
        <span>{min.toFixed(decimals === 0 ? 0 : 0)}</span>
        {hint && <span className="text-slate-500">{hint}</span>}
        <span>{max.toFixed(0)}</span>
      </div>
    </div>
  );
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));
