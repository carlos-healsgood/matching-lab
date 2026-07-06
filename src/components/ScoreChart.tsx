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

export interface Pt {
  x: number;
  score: number; // 0..100
}

export interface Marker {
  x: number;
  label: string;
  color?: string;
}

export function ScoreChart({
  data,
  xLabel,
  maxX,
  markers = [],
  query,
  unitSuffix = "",
}: {
  data: Pt[];
  xLabel: string;
  maxX: number;
  markers?: Marker[];
  query?: { x: number; score: number } | null;
  unitSuffix?: string;
}) {
  return (
    <div className="h-[380px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 24, left: 4 }}>
          <defs>
            <linearGradient id="scoreStroke2" x1="0" y1="0" x2="1" y2="0">
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
              value: xLabel,
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
          <Tooltip
            content={({ active, payload, label }: any) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="rounded-lg border border-white/10 bg-[#0b0f1a]/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
                  <div className="text-slate-400">
                    {typeof label === "number" ? label.toFixed(1) : label}
                    {unitSuffix}
                  </div>
                  <div className="mt-1 font-semibold text-violet-300 tabular-nums">
                    score {payload[0].payload.score.toFixed(1)}%
                  </div>
                </div>
              );
            }}
          />

          <ReferenceLine y={50} stroke="#334155" strokeDasharray="4 4" />
          {markers.map((m, i) => (
            <ReferenceLine
              key={i}
              x={m.x}
              stroke={m.color ?? "#22d3ee"}
              strokeDasharray="4 4"
              strokeOpacity={0.6}
              label={{
                value: m.label,
                fill: m.color ?? "#22d3ee",
                fontSize: 12,
                position: "top",
              }}
            />
          ))}

          <Line
            type="monotone"
            dataKey="score"
            stroke="url(#scoreStroke2)"
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
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
