import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  XAxis,
  YAxis,
} from "recharts";
import { curveScore, formatMiles, type Placement, type Proposal } from "../../lib/candidates";
import { COLORS, originLabel } from "./theme";

interface Point {
  x: number;
  y: number;
  placement: Placement;
  isTry: boolean;
}

export function CandidatesChart({
  proposal,
  placements,
  tryPlacement,
  xMax,
  hover,
  onHover,
}: {
  proposal: Proposal;
  placements: Placement[];
  tryPlacement: Placement | null;
  xMax: number;
  hover: string | null;
  onHover: (id: string | null) => void;
}) {
  const curve = [];
  for (let x = 0; x < proposal.capMi; x += 1) curve.push({ x, score: curveScore(x, proposal) });
  curve.push({ x: proposal.capMi - 0.01, score: curveScore(proposal.capMi - 0.01, proposal) });

  const toPoint = (pl: Placement, isTry: boolean): Point => ({
    x: pl.candidate.distanceMi ?? 0,
    y: pl.score ?? 0,
    placement: pl,
    isTry,
  });
  const points = placements.map((pl) => toPoint(pl, false));
  const tryPoints = tryPlacement ? [toPoint(tryPlacement, true)] : [];

  const ticks = [0, proposal.kneeMi, 120, 180, proposal.capMi, xMax].filter(
    (t, i, a) => t <= xMax && a.indexOf(t) === i,
  );
  ticks.sort((a, b) => a - b);

  const shape = (props: unknown) => {
    const { cx, cy, payload } = props as { cx: number; cy: number; payload: Point };
    return (
      <Marker
        cx={cx}
        cy={cy}
        point={payload}
        xMax={xMax}
        kneeMi={proposal.kneeMi}
        active={hover === payload.placement.candidate.id}
        onHover={onHover}
      />
    );
  };

  return (
    <div className="h-[440px] w-full select-none">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart margin={{ top: 26, right: 18, bottom: 28, left: 6 }}>
          <CartesianGrid stroke="#1e2740" strokeDasharray="3 3" />
          <ReferenceArea x1={0} x2={proposal.kneeMi} y1={0} y2={100} fill={COLORS.commute} fillOpacity={0.07} ifOverflow="hidden"
            label={{ value: "Normal commute", position: "top", fill: "#6ee7b7", fontSize: 11 }} />
          <ReferenceArea x1={proposal.kneeMi} x2={proposal.capMi} y1={0} y2={100} fill={COLORS.fall} fillOpacity={0.045} ifOverflow="hidden"
            label={{ value: "Score drops fast", position: "top", fill: "#fcd34d", fontSize: 11 }} />
          <ReferenceArea x1={proposal.capMi} x2={xMax} y1={0} y2={100} fill={COLORS.beyond} fillOpacity={0.09} ifOverflow="hidden"
            label={{ value: "AI: not shown", position: "top", fill: "#fca5a5", fontSize: 11 }} />
          <ReferenceLine x={proposal.capMi} stroke={COLORS.hidden} strokeDasharray="5 4" strokeWidth={1.5}
            label={{ value: `${formatMiles(proposal.capMi)} cap`, position: "insideTopLeft", fill: "#fca5a5", fontSize: 12, fontWeight: 600 }} />
          <XAxis
            type="number"
            dataKey="x"
            domain={[0, xMax]}
            ticks={ticks}
            allowDataOverflow
            stroke="#4b5675"
            tick={{ fill: "#7c869e", fontSize: 12 }}
            tickFormatter={(v: number) => `${v}`}
            label={{ value: "distance from the vacancy (miles)", position: "insideBottom", offset: -14, fill: "#7c869e", fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            stroke="#4b5675"
            tick={{ fill: "#7c869e", fontSize: 12 }}
            width={40}
            label={{ value: "distance score", angle: -90, position: "insideLeft", offset: 12, fill: "#7c869e", fontSize: 12 }}
          />
          <Line
            data={curve}
            dataKey="score"
            type="linear"
            stroke="#8b5cf6"
            strokeOpacity={0.85}
            strokeWidth={3}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          <Scatter data={points} dataKey="y" shape={shape} isAnimationActive={false} />
          <Scatter data={tryPoints} dataKey="y" shape={shape} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function Marker({
  cx,
  cy,
  point,
  xMax,
  kneeMi,
  active,
  onHover,
}: {
  cx: number;
  cy: number;
  point: Point;
  xMax: number;
  kneeMi: number;
  active: boolean;
  onHover: (id: string | null) => void;
}) {
  const { placement, isTry } = point;
  const { candidate, shown, score } = placement;
  const color = isTry ? COLORS.try : !shown ? COLORS.hidden : COLORS[candidate.origin];
  const r = active ? 10 : 8;
  const labelLeft = point.x > xMax * 0.62;
  const alwaysLabel = isTry || point.x > kneeMi;

  const glyph = isTry ? (
    <path
      d={star(cx, cy, r + 3, (r + 3) / 2.3)}
      fill={color}
      stroke="#0b0f1a"
      strokeWidth={2}
    />
  ) : candidate.origin === "applied" ? (
    <circle cx={cx} cy={cy} r={r} fill={color} stroke="#0b0f1a" strokeWidth={2} />
  ) : (
    <rect
      x={cx - r * 0.8}
      y={cy - r * 0.8}
      width={r * 1.6}
      height={r * 1.6}
      transform={`rotate(45 ${cx} ${cy})`}
      fill={shown ? color : "#0b0f1a"}
      stroke={shown ? "#0b0f1a" : color}
      strokeWidth={2}
      strokeDasharray={shown ? undefined : "3 2"}
    />
  );

  const detail = `${candidate.name} · ${originLabel(candidate.origin)} · ${formatMiles(candidate.distanceMi ?? 0)} · ${
    shown ? `score ${score}` : "not shown"
  }`;

  return (
    <g
      style={{ cursor: "pointer" }}
      onMouseEnter={() => onHover(candidate.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onHover(candidate.id)}
    >
      {active && <circle cx={cx} cy={cy} r={r + 8} fill={color} fillOpacity={0.18} />}
      <circle cx={cx} cy={cy} r={16} fill="transparent" />
      {glyph}
      {active ? (
        <g pointerEvents="none">
          <rect
            x={labelLeft ? cx - 14 - detail.length * 6.3 : cx + 14}
            y={cy - 30}
            width={detail.length * 6.3}
            height={22}
            rx={6}
            fill="#0b0f1a"
            stroke={color}
            strokeOpacity={0.6}
          />
          <text
            x={labelLeft ? cx - 14 - detail.length * 3.15 : cx + 14 + detail.length * 3.15}
            y={cy - 15}
            textAnchor="middle"
            fill="#e5e9f2"
            fontSize={11.5}
            fontWeight={500}
          >
            {detail}
          </text>
        </g>
      ) : (
        alwaysLabel && (
          <text
            x={cx + 12}
            y={cy - 10}
            textAnchor="start"
            fill={isTry ? COLORS.try : "#94a3b8"}
            fontSize={11}
            pointerEvents="none"
          >
            {isTry ? "Your candidate" : candidate.name}
          </text>
        )
      )}
    </g>
  );
}

function star(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return `M${pts.join("L")}Z`;
}
