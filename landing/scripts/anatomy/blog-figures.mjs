// Builds the blueprint figures used as blog headers, with the anatomy kit (MIT, see LICENSE-anatomy).
// Run: node scripts/anatomy/blog-figures.mjs  →  public/blog-figures/<name>.svg
import { writeFileSync } from "node:fs";
import * as k from "./iso-kit.mjs";

const W = 1200;
const H = 600;
// Calbee's brand yellow marks the one thing each figure is about (the open time, the pick, whose turn it is).
const ACCENT_CSS = `
.cb-yellow>.iso-fill{fill:#c9cf2c}
.cb-yellow>.iso-top{fill:#ebf23a}
.cb-yellow>.iso-shade[data-shade="0"]{fill:#8f9420}
.cb-yellow>.iso-shade[data-shade="1"]{fill:#a3a824}
.cb-yellow>.iso-shade[data-shade="2"]{fill:#b6bb28}
.cb-yellow>.iso-shade[data-shade="3"]{fill:#c9cf2c}
.cb-yellow>.iso-edge{stroke:#f6f9a8}
.cb-yellow>.iso-line{stroke:#6f7318}
.iso-line[data-tone="yellow"]{stroke:#ebf23a}
.iso-dots[data-tone="yellow"] circle{fill:#ebf23a;opacity:1}
`;
const OUT = new URL("../../public/blog-figures/", import.meta.url);

/** Solids are painted far-to-near so nearer ones cover the ones behind. */
function scene(P) {
  const items = [];
  const at = (p) => k.iso(p, P);
  return {
    at,
    solid(center, svg) {
      items.push({ depth: k.depthOf(center, P), svg });
    },
    under(svg) {
      items.push({ depth: Number.NEGATIVE_INFINITY, svg });
    },
    over(svg) {
      items.push({ depth: Number.POSITIVE_INFINITY, svg });
    },
    render(label) {
      items.sort((a, b) => a.depth - b.depth);
      return k.figureSvg({ width: W, height: H, label, body: items.map((i) => i.svg), standalone: true }).replace("</style>", `${ACCENT_CSS}</style>`);
    },
  };
}

const slab = (P, plan, z, h, style = {}, bevel = 0.5) => k.solidSvg(k.slabOf(plan, z, h, P, 6, bevel), { tone: "hi", crease: "faint", ...style });
const cyl = (P, cx, cy, r, z, h, style = {}) => k.solidSvg(k.cylinder(cx, cy, r, z, h, P, 40, 0.3), { tone: "hi", crease: "faint", ...style });

function calendar() {
  const base = { x: 0, y: 0, w: 74, d: 60, r: 3 };
  const P = k.fitProjection(k.boxCorners(base, 0, 14), W, H, { pad: 60 });
  const S = scene(P);
  S.under(`<path class="iso-halo" d="${k.haloOf(base, 0, 4, P)}"/>` + slab(P, base, 0, 4, { tone: "mid" }, 1));
  // header strip with the month's rings
  const head = { x: 3, y: 3, w: 68, d: 8, r: 1.2 };
  S.solid([37, 7, 4], slab(P, head, 4, 0.8, { tone: "lo", crease: "none" }) + k.lineSvg([10, 30, 44, 64].map((x) => k.ring(x, 7, 1.2, 4.8, P, 16)).join(""), { tone: "mid" }));
  const booked = new Set(["1,1", "3,1", "4,2", "0,3", "2,3", "5,3", "1,4", "6,2", "2,0", "5,0"]);
  const open = "3,3";
  const tile = 8.4;
  const gap = 1.3;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 7; col++) {
      const x = 3.2 + col * (tile + gap);
      const y = 13 + row * (tile + gap);
      const plan = { x, y, w: tile, d: tile, r: 0.8 };
      const key = `${col},${row}`;
      const c = [x + tile / 2, y + tile / 2, 4];
      if (key === open) {
        S.solid(c, slab(P, plan, 4, 5, { tone: "lit", lit: true }, 0.4));
        S.over(k.lineSvg(k.segment([c[0], c[1], 9.5], [c[0], c[1], 17], P), { tone: "yellow", dashed: true }) + k.dotsSvg([S.at([c[0], c[1], 17.6])], { size: 4.5, tone: "yellow" }));
      } else if (booked.has(key)) {
        S.solid(c, slab(P, plan, 4, 2.2, { tone: "mid", className: "cb-yellow" }, 0.3));
      } else {
        S.solid(c, slab(P, plan, 4, 0.5, { tone: "lo", crease: "none" }, 0.2));
      }
    }
  }
  return S.render("A month calendar with booked days raised and one open day lifted");
}

function compare() {
  const base = { x: 0, y: 0, w: 84, d: 34, r: 3 };
  const P = k.fitProjection(k.boxCorners(base, 0, 40), W, H, { pad: 60 });
  const S = scene(P);
  S.under(`<path class="iso-halo" d="${k.haloOf(base, 0, 3, P)}"/>` + slab(P, base, 0, 3, { tone: "mid" }, 1));
  const ticks = k.topTicks(6, 78, 2, 5, 30, 3.05, [1.1, 2.1], P);
  S.under(k.lineSvg(ticks.minor, { tone: "faint" }) + k.lineSvg(ticks.major, { tone: "lo" }));
  const towers = [
    { x: 8, h: 16, tone: "mid" },
    { x: 34, h: 30, tone: "lit", lit: true },
    { x: 60, h: 22, tone: "mid" },
  ];
  for (const t of towers) {
    const plan = { x: t.x, y: 8, w: 16, d: 16, r: 1.6 };
    const c = [t.x + 8, 16, 3];
    let svg = slab(P, plan, 3, t.h, { tone: t.tone, className: t.lit ? "cb-yellow" : undefined }, 0.6);
    // each tower is a stack of calendar pages: seams every 4 units
    for (let z = 3 + 4; z < 3 + t.h - 1; z += 4) svg += k.lineSvg(k.sideSeam(plan, z, P, 6), { tone: "faint" });
    svg += k.dotsSvg(k.dotGrid(t.x + 3.5, 11.5, 3, 3, 4.5, 3 + t.h, P), { size: 0.9, tone: "mid" });
    S.solid(c, svg);
    if (t.lit) S.over(k.lineSvg(k.segment([42, 16, 3 + t.h + 1], [42, 16, 3 + t.h + 7], P), { tone: "yellow", dashed: true }) + k.dotsSvg([S.at([42, 16, 3 + t.h + 7.6])], { size: 4.5, tone: "yellow" }));
  }
  return S.render("Three scheduling tools compared as towers, with the tallest one highlighted");
}

function rotation() {
  const P0 = k.fitProjection(k.boxCorners({ x: -36, y: -36, w: 72, d: 72 }, 0, 16), W, H, { pad: 60 });
  const P = P0;
  const S = scene(P);
  S.under(`<path class="iso-halo" d="${k.haloOf({ x: -34, y: -34, w: 68, d: 68, r: 34 }, 0, 3, P)}"/>` + cyl(P, 0, 0, 34, 0, 3, { tone: "mid" }));
  S.under(k.lineSvg(k.ring(0, 0, 25, 3.05, P, 72), { tone: "lo", dashed: true }) + k.lineSvg(k.radialTicks(0, 0, 31, 48, 4, 3.05, [1, 2], P).minor ?? "", { tone: "faint" }));
  S.solid([0, 0, 3], cyl(P, 0, 0, 11, 3, 7, { tone: "mid" }) + k.lineSvg(k.ring(0, 0, 7.5, 10.05, P, 40), { tone: "faint" }));
  const people = 5;
  for (let i = 0; i < people; i++) {
    const a = (i / people) * Math.PI * 2 + 0.5;
    const x = Math.cos(a) * 25;
    const y = Math.sin(a) * 25;
    const next = i === 2;
    const style = next ? { tone: "mid", className: "cb-yellow" } : { tone: "hi" };
    S.solid([x, y, 3], cyl(P, x, y, 4, 3, 9, style) + cyl(P, x, y, 2.9, 13.5, 4.6, style));
    if (next) S.over(k.lineSvg(k.segment([x, y, 18.5], [x, y, 25], P), { tone: "yellow", dashed: true }) + k.dotsSvg([S.at([x, y, 25.6])], { size: 4.5, tone: "yellow" }));
  }
  return S.render("A team seated around a table, with the next person in the rotation highlighted");
}

for (const [name, build] of Object.entries({ calendar, compare, rotation })) {
  writeFileSync(new URL(`${name}.svg`, OUT), build());
  console.log("wrote", name);
}
