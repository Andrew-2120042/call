/** Decorative, motion-light graphics for the home page. All are aria-hidden. */

const CX = 260;
const CY = 230;

/** A receding tunnel: rings that shrink towards a vanishing point, spokes, and dots travelling inward. */
export function TunnelGraphic() {
  const rings = [1, 0.74, 0.54, 0.38, 0.26, 0.17, 0.1];
  const spokes = Array.from({ length: 16 }, (_, i) => (i / 16) * Math.PI * 2);
  const outerRx = 250;
  const outerRy = 200;
  const vx = CX + 30;
  const vy = CY - 25;
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-lg">
      <svg viewBox="0 0 520 460" className="h-auto w-full">
        {rings.map((k) => (
          <ellipse
            key={k}
            cx={vx + (CX - vx) * k}
            cy={vy + (CY - vy) * k}
            rx={outerRx * k}
            ry={outerRy * k}
            fill="none"
            stroke="var(--color-line-strong)"
            strokeWidth={0.8}
          />
        ))}
        {spokes.map((a) => (
          <line
            key={a}
            x1={CX + Math.cos(a) * outerRx}
            y1={CY + Math.sin(a) * outerRy}
            x2={vx}
            y2={vy}
            stroke="var(--color-line)"
            strokeWidth={0.8}
          />
        ))}
        <circle cx={vx} cy={vy} r={3} fill="#fff" />
        <circle cx={vx} cy={vy} r={14} fill="rgba(37,99,235,0.35)" style={{ filter: "blur(8px)" }} />
        {spokes
          .filter((_, i) => i % 3 === 0)
          .map((a, i) => (
            <circle
              key={a}
              r={2.2}
              fill="#fff"
              className="tunnel-dot"
              style={{
                offsetPath: `path("M ${CX + Math.cos(a) * outerRx} ${CY + Math.sin(a) * outerRy} L ${vx} ${vy}")`,
                animationDelay: `${i * 0.8}s`,
              }}
            />
          ))}
      </svg>
    </div>
  );
}

/** A field of faint dots with a few joined into a small network. */
export function ConstellationGraphic() {
  const cols = 14;
  const rows = 8;
  const gap = 34;
  const lit = new Set(["3-2", "5-3", "7-2", "8-4", "10-3", "6-5", "4-5", "9-6", "11-5"]);
  const links: [string, string][] = [
    ["3-2", "5-3"],
    ["5-3", "7-2"],
    ["7-2", "8-4"],
    ["8-4", "10-3"],
    ["5-3", "6-5"],
    ["6-5", "4-5"],
    ["8-4", "9-6"],
    ["10-3", "11-5"],
    ["9-6", "11-5"],
  ];
  const pos = (key: string) => {
    const [c, r] = key.split("-").map(Number);
    return { x: 20 + c * gap, y: 20 + r * gap };
  };
  return (
    <svg aria-hidden viewBox={`0 0 ${40 + (cols - 1) * gap} ${40 + (rows - 1) * gap}`} className="h-auto w-full">
      {links.map(([a, b]) => {
        const p = pos(a);
        const q = pos(b);
        return <line key={a + b} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="rgba(37,99,235,0.45)" strokeWidth={1} />;
      })}
      {Array.from({ length: cols * rows }, (_, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const key = `${c}-${r}`;
        const { x, y } = pos(key);
        return lit.has(key) ? (
          <circle key={key} cx={x} cy={y} r={3} fill="#fff" />
        ) : (
          <circle key={key} cx={x} cy={y} r={1.1} fill="var(--color-line-strong)" />
        );
      })}
    </svg>
  );
}

/** A rising curve over fine vertical hatching, the shape of a calendar filling up over time. */
export function GrowthCurve() {
  const w = 640;
  const h = 300;
  const d = `M 0 ${h - 12} C ${w * 0.45} ${h - 18}, ${w * 0.7} ${h * 0.55}, ${w} 8`;
  return (
    <svg aria-hidden viewBox={`0 0 ${w} ${h}`} className="h-auto w-full">
      <defs>
        <linearGradient id="curve-stroke" x1="0" x2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
        <clipPath id="curve-area">
          <path d={`${d} L ${w} ${h} L 0 ${h} Z`} />
        </clipPath>
      </defs>
      <g clipPath="url(#curve-area)">
        {Array.from({ length: 80 }, (_, i) => (
          <line key={i} x1={i * 8} y1={0} x2={i * 8} y2={h} stroke="var(--color-line)" strokeWidth={1} />
        ))}
      </g>
      <path d={d} fill="none" stroke="url(#curve-stroke)" strokeWidth={2} />
      <line x1={0} y1={h - 0.5} x2={w} y2={h - 0.5} stroke="var(--color-line-strong)" />
    </svg>
  );
}
