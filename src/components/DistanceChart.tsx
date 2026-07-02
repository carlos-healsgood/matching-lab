import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Unit } from "../lib/units";

export interface ChartPoint {
  x: number; // distance in the active display unit
  score: number; // 0..100
}

export function DistanceChart({
  data,
  unit,
  maxX,
  midpoint,
  query,
}: {
  data: ChartPoint[];
  unit: Unit;
  maxX: number;
  midpoint: number; // d0 in display unit
  query: { x: number; score: number } | null;
}) {
  return (
    <div className="h-[380px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 24, left: 4 }}>
          <defs>
            <linearGradient id="scoreStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1e2740" strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            domain={[0, maxX]}
            tickCount={9}
            stroke="#4b5675"
            tick={{ fill: "#7c869e", fontSize: 12 }}
            tickFormatter={(v: number) => `${Math.round(v)}`}
            label={{
              value: `distance (${unit})`,
              position: "insideBottom",
              offset: -12,
              fill: "#7c869e",
              fontSize: 12,
            }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            stroke="#4b5675"
            tick={{ fill: "#7c869e", fontSize: 12 }}
            tickFormatter={(v: number) => `${v}%`}
            width={44}
          />
          <Tooltip content={<ScoreTooltip unit={unit} />} />

          <ReferenceLine y={50} stroke="#334155" strokeDasharray="4 4" />
          <ReferenceLine
            x={midpoint}
            stroke="#22d3ee"
            strokeDasharray="4 4"
            strokeOpacity={0.6}
            label={{ value: "d₀", fill: "#22d3ee", fontSize: 12, position: "top" }}
          />

          <Line
            type="monotone"
            dataKey="score"
            stroke="url(#scoreStroke)"
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
            name="score"
          />

          {query && (
            <ReferenceDot
              x={query.x}
              y={query.score}
              r={6}
              fill="#f5f3ff"
              stroke="#7c3aed"
              strokeWidth={3}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ScoreTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
  label?: number;
  unit: Unit;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/10 bg-[#0b0f1a]/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      <div className="text-slate-400">
        {typeof label === "number" ? label.toFixed(2) : label} {unit}
      </div>
      <div className="mt-1 font-semibold text-violet-300 tabular-nums">
        score {p.score.toFixed(2)}%
      </div>
    </div>
  );
}
