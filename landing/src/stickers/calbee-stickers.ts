// Calbee's illustrations, drawn as fun-isometric slab stickers (see LICENSE-fun-isometric) on the kit's motion presets.
import { VIEWS, arc, ellipse, line, pill, poly, rect, ring, rosette, spark, star } from "./fun";
import type { Icon, Layer, Motion, Vec } from "./fun";
import { bob, bounce, float, hop, sparkle, sway, twinkle, wobble } from "./motions";

const LINE = 5;
const { tilt: FACE, extrude: EXT } = VIEWS.right;

const glow = (parent: string, p: Vec, r: number, m: Motion | ReadonlyArray<Motion>): Layer => ({
  parent,
  a: p,
  p,
  m,
  shapes: [{ d: spark(p[0], p[1], r), fill: "white" }],
});
const tick = (x: number, y: number, s = 1) => line([x - 22 * s, y], [x - 6 * s, y + 16 * s], [x + 24 * s, y - 18 * s]);

// A month page with a booked day that gets a green tick
export const calendar: Icon = {
  name: "calendar",
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: "page", a: [0, 110], p: [250, 300], m: float, shapes: [] },
    {
      id: "face",
      parent: "page",
      tilt: FACE,
      shapes: [
        { d: rect(-130, -120, 260, 240, 26), fill: "white", depth: 1 },
        { d: rect(-130, -120, 260, 62, 26), fill: "main", depth: 0.3 },
        ...[-60, 60].map((x) => ({ d: pill(x - 9, -146, 18, 52), fill: "grey" as const, depth: 0.6 })),
        ...[0, 1, 2].flatMap((row) =>
          [0, 1, 2, 3].map((col) => ({
            d: rect(-104 + col * 54, -40 + row * 50, 38, 34, 8),
            fill: (row === 1 && col === 2 ? "ok" : "tint") as "ok" | "tint",
            depth: row === 1 && col === 2 ? 0.4 : 0,
          }))
        ),
      ],
    },
    { id: "badge", parent: "page", a: [118, -118], p: [118, -118], m: { ...hop, at: 30 }, shapes: [] },
    { parent: "badge", tilt: FACE, shapes: [{ d: rosette(118, -118, 50, 9), fill: "ok", depth: 0.8 }, { d: tick(118, -118, 1.1), line: 9 }] },
    glow("badge", [168, -172], 20, sparkle(64)),
  ],
};

// The waitlist: three people in line, the front one hops forward when a time opens
export const waitlist: Icon = {
  name: "waitlist",
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: "row", a: [0, 120], p: [250, 300], m: sway, shapes: [] },
    ...[
      { x: 92, c: "deep" as const, m: bob },
      { x: 0, c: "gold" as const, m: { ...bob, at: 20 } },
      { x: -92, c: "main" as const, m: { ...hop, at: 40 } },
    ].flatMap(({ x, c, m }, i): Layer[] => [
      { id: `p${i}`, parent: "row", a: [x, 90], p: [x, 0], m, shapes: [] },
      {
        parent: `p${i}`,
        tilt: FACE,
        shapes: [
          { d: rect(x - 50, 0, 100, 110, 46), fill: c, depth: 1 },
          { d: ellipse(x, -40, 40), fill: "white", depth: 0.8 },
          { d: arc(x, -36, 16, 30, 150) },
        ],
      },
    ]),
    { id: "ticket", parent: "row", a: [-92, -130], p: [-92, -130], m: { ...bounce, at: 50 }, shapes: [] },
    {
      parent: "ticket",
      tilt: FACE,
      shapes: [
        { d: rect(-150, -160, 116, 60, 14), fill: "ok", depth: 0.5 },
        { d: line([-130, -138], [-62, -138]), line: 6 },
        { d: line([-130, -120], [-90, -120]), line: 6 },
      ],
    },
    glow("ticket", [-26, -178], 18, sparkle(80)),
  ],
};

// A clock whose hands sweep round
export const clock: Icon = {
  name: "clock",
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: "body", a: [0, 120], p: [250, 290], m: wobble, shapes: [] },
    {
      id: "face",
      parent: "body",
      tilt: FACE,
      shapes: [
        { d: ellipse(0, 0, 130), fill: "deep", depth: 1 },
        { d: ellipse(0, 0, 104), fill: "white" },
        ...[0, 90, 180, 270].map((deg) => {
          const r = (deg * Math.PI) / 180;
          return { d: ellipse(Math.cos(r) * 82, Math.sin(r) * 82, 8), fill: "ink" as const, line: false };
        }),
      ],
    },
    { id: "hands", parent: "face", a: [0, 0], p: [0, 0], r: [[0, 0], [180, 360]], shapes: [{ d: line([0, 0], [0, -74]), line: 10, round: true }] },
    { parent: "face", a: [0, 0], p: [0, 0], r: [[0, 0], [180, 30]], shapes: [{ d: line([0, 0], [48, 0]), line: 12, round: true }] },
    { parent: "face", shapes: [{ d: ellipse(0, 0, 14), fill: "hot" }] },
    { id: "bell", parent: "body", a: [-110, -110], p: [-110, -110], m: { ...hop, at: 60 }, shapes: [] },
    { parent: "bell", tilt: FACE, shapes: [{ d: ellipse(-110, -110, 34), fill: "gold", depth: 0.6 }] },
  ],
};

// An envelope with an offer card rising out of it
export const envelope: Icon = {
  name: "envelope",
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: "env", a: [0, 100], p: [250, 320], m: float, shapes: [] },
    { id: "card", parent: "env", a: [0, -40], p: [0, 0], m: { ...bounce, at: 20 }, shapes: [] },
    {
      parent: "card",
      tilt: FACE,
      shapes: [
        { d: rect(-96, -150, 192, 150, 14), fill: "white", depth: 0.3 },
        { d: rect(-70, -122, 140, 30, 10), fill: "ok" },
        { d: line([-70, -66], [60, -66]), line: 6 },
        { d: line([-70, -44], [20, -44]), line: 6 },
      ],
    },
    {
      parent: "env",
      tilt: FACE,
      shapes: [
        { d: rect(-130, -60, 260, 150, 18), fill: "main", depth: 1 },
        { d: poly([[-130, -60], [0, 30], [130, -60]], [18, 10, 18]), fill: "tint", depth: 0.2 },
      ],
    },
    glow("env", [140, -130], 22, sparkle(50)),
  ],
};

// A confirmed rosette badge with a tick
export const confirm: Icon = {
  name: "confirm",
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: "badge", a: [0, 120], p: [250, 290], m: hop, shapes: [] },
    { parent: "badge", tilt: FACE, shapes: [{ d: rosette(0, 0, 128, 12), fill: "ok", depth: 1 }, { d: ellipse(0, 0, 86), fill: "white" }, { d: tick(0, 0, 2.2), line: 14 }] },
    glow("badge", [120, -120], 24, sparkle(40)),
    glow("badge", [-130, 80], 16, sparkle(100)),
  ],
};

// Three teammates side by side
export const team: Icon = {
  name: "team",
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: "group", a: [0, 120], p: [250, 300], m: wobble, shapes: [] },
    ...[
      { x: -100, y: 20, c: "hot" as const, at: 0 },
      { x: 100, y: 20, c: "deep" as const, at: 30 },
      { x: 0, y: -10, c: "main" as const, at: 60 },
    ].flatMap(({ x, y, c, at }, i): Layer[] => [
      { id: `m${i}`, parent: "group", a: [x, y + 110], p: [x, y], m: { ...bob, at }, shapes: [] },
      {
        parent: `m${i}`,
        tilt: FACE,
        shapes: [
          { d: rect(x - 62, y, 124, 120, 56), fill: c, depth: 1 },
          { d: ellipse(x, y - 46, 46), fill: "tint", depth: 0.8 },
          { d: arc(x, y - 42, 18, 30, 150) },
        ],
      },
    ]),
    glow("group", [0, -150], 20, sparkle(90)),
  ],
};

// A magnifying glass, for comparisons
export const compare: Icon = {
  name: "compare",
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: "glass", a: [40, 130], p: [240, 280], m: sway, shapes: [] },
    {
      parent: "glass",
      tilt: FACE,
      shapes: [
        { d: pill(40, 60, 46, 130), fill: "hot", depth: 1 },
        { d: ring(0, -20, 120, 86), fill: "deep", depth: 1 },
        { d: ellipse(0, -20, 86), fill: "tint" },
        { d: arc(-10, -30, 50, 200, 270), line: 8 },
      ],
    },
    { id: "star", parent: "glass", a: [0, -20], p: [0, -20], m: { ...twinkle(30) }, shapes: [] },
    { parent: "star", tilt: FACE, shapes: [{ d: star(0, -20, 44), fill: "gold", depth: 0.5 }] },
  ],
};

// Three bars climbing, for growth
export const growth: Icon = {
  name: "growth",
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: "chart", a: [0, 120], p: [250, 310], m: float, shapes: [] },
    ...[
      { x: -100, h: 90, c: "tint" as const, at: 0 },
      { x: 0, h: 150, c: "main" as const, at: 20 },
      { x: 100, h: 220, c: "ok" as const, at: 40 },
    ].flatMap(({ x, h, c, at }, i): Layer[] => [
      { id: `b${i}`, parent: "chart", a: [x, 110], p: [x, 0], m: { ...bounce, at }, shapes: [] },
      { parent: `b${i}`, tilt: FACE, shapes: [{ d: rect(x - 40, 110 - h, 80, h, 12), fill: c, depth: 1 }] },
    ]),
    { id: "coin", parent: "chart", a: [100, -150], p: [100, -150], m: { ...hop, at: 70 }, shapes: [] },
    { parent: "coin", tilt: FACE, shapes: [{ d: ellipse(100, -150, 38), fill: "gold", depth: 0.7 }, { d: star(100, -150, 18), fill: "white" }] },
  ],
};

// A speech bubble with three dots, for calls
export const call: Icon = {
  name: "call",
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: "bub", a: [0, 70], p: [250, 300], m: hop, shapes: [] },
    {
      id: "face",
      parent: "bub",
      tilt: FACE,
      shapes: [
        { d: poly([[-128, -92], [128, -92], [128, 70], [-30, 70], [-92, 118], [-76, 70], [-128, 70]], [30, 30, 30, 4, 6, 4, 30]), fill: "deep", depth: 1 },
        { d: rect(-100, -66, 200, 112, 24), fill: "white" },
      ],
    },
    ...[-52, 0, 52].map(
      (x, i): Layer => ({
        parent: "face",
        a: [x, -10],
        p: [x, -10],
        m: [twinkle(14 + i * 9), twinkle(120 + i * 6, true)],
        shapes: [{ d: ellipse(x, -10, 16), fill: "ink", line: false }],
      })
    ),
    glow("bub", [138, -112], 22, sparkle(40)),
  ],
};

// A price tag marked free
export const free: Icon = {
  name: "free",
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: "tag", a: [-120, -60], p: [250, 260], m: sway, shapes: [] },
    {
      parent: "tag",
      tilt: FACE,
      shapes: [
        { d: poly([[-130, -40], [-60, -110], [130, -110], [130, 110], [-60, 110], [-130, 40]], [14, 20, 24, 24, 20, 14]), fill: "gold", depth: 1 },
        { d: ellipse(-82, 0, 18), fill: "white" },
        { d: rect(-30, -40, 130, 80, 16), fill: "white" },
        { d: line([-6, -12], [76, -12]), line: 8 },
        { d: line([-6, 14], [46, 14]), line: 8 },
      ],
    },
    glow("tag", [130, -140], 22, sparkle(60)),
  ],
};

export const STICKERS = { calendar, waitlist, clock, envelope, confirm, team, compare, growth, call, free } satisfies Record<string, Icon>;
export type StickerName = keyof typeof STICKERS;
