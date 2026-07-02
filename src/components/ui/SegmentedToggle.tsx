export interface SegOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  size = "md",
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
}) {
  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm";
  return (
    <div className="inline-flex rounded-xl bg-white/5 p-1 ring-1 ring-white/10">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            disabled={opt.disabled}
            onClick={() => onChange(opt.value)}
            className={[
              "rounded-lg font-medium transition-all",
              pad,
              active
                ? "bg-violet-500 text-white shadow-[0_2px_10px_-2px_rgba(124,58,237,0.7)]"
                : opt.disabled
                  ? "cursor-not-allowed text-slate-600"
                  : "text-slate-300 hover:text-white hover:bg-white/5",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
