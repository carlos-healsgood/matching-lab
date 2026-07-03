import { Plus, Trash2 } from "lucide-react";
import type { Band } from "../../lib/algorithms/distance";
import { fromKm, toKm, unitShort, round, type Unit } from "../../lib/units";

export function BandsEditor({
  value,
  unit,
  onChange,
}: {
  value: Band[];
  unit: Unit;
  onChange: (bands: Band[]) => void;
}) {
  const setBand = (i: number, patch: Partial<Band>) =>
    onChange(value.map((b, j) => (j === i ? { ...b, ...patch } : b)));
  const add = () => onChange([...value, { width: toKm(10, unit), drop: 0.1 }]);
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));

  let level = 1;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1.6rem_1fr_1fr_3rem_1.6rem] items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        <span>#</span>
        <span>width ({unitShort(unit)})</span>
        <span>drop</span>
        <span className="text-right">level</span>
        <span />
      </div>

      {value.map((b, i) => {
        level = Math.max(0, level - b.drop);
        const endLevel = level;
        return (
          <div
            key={i}
            className="grid grid-cols-[1.6rem_1fr_1fr_3rem_1.6rem] items-center gap-2"
          >
            <span className="text-xs text-slate-500 tabular-nums">{i + 1}</span>
            <input
              type="number"
              min={0}
              step={unit === "mi" ? 0.5 : 1}
              value={round(fromKm(b.width, unit), 2)}
              onChange={(e) =>
                setBand(i, { width: toKm(Math.max(0, +e.target.value), unit) })
              }
              className="w-full rounded-lg bg-white/5 px-2 py-1 text-sm tabular-nums text-slate-100 ring-1 ring-white/10 outline-none focus:ring-violet-500/50"
            />
            <input
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={round(b.drop, 2)}
              onChange={(e) =>
                setBand(i, {
                  drop: Math.min(1, Math.max(0, +e.target.value)),
                })
              }
              className="w-full rounded-lg bg-white/5 px-2 py-1 text-sm tabular-nums text-slate-100 ring-1 ring-white/10 outline-none focus:ring-violet-500/50"
            />
            <span className="text-right text-xs tabular-nums text-cyan-300">
              {endLevel.toFixed(2)}
            </span>
            <button
              onClick={() => remove(i)}
              disabled={value.length <= 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-rose-300 disabled:opacity-30"
              title="Remove band"
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      })}

      <button
        onClick={add}
        className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
      >
        <Plus size={13} /> Add band
      </button>
    </div>
  );
}
