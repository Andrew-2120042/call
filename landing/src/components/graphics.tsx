import Image from "next/image";

/** Decorative, motion-light graphics for the home page. All are aria-hidden. */

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

/** A small settings-style panel: a title and rows of label + value, with an optional logo per row. */
export function HoodPanel({ title, rows }: { title: string; rows: [string | null, string, string][] }) {
  return (
    <div className="rounded-2xl border border-line-strong bg-surface/80 p-2 shadow-2xl shadow-black/10 backdrop-blur">
      <p className="text-faint px-3 pt-2 pb-3 text-[11px]">{title}</p>
      <ul className="divide-y divide-line rounded-xl border border-line bg-bg">
        {rows.map(([logo, label, value]) => (
          <li key={label} className="flex items-center gap-3 px-4 py-3.5 text-[13px]">
            {logo ? (
              <Image src={logo} alt="" width={20} height={20} className="h-5 w-5 object-contain" />
            ) : (
              <span className="bg-line-strong h-1.5 w-1.5 rounded-full" />
            )}
            <span className="font-medium">{label}</span>
            <span className="text-faint ms-auto text-xs">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
