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
    { id: "page", a: [0, 110], p: [250, 360], m: float, shapes: [] },
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
    { id: "row", a: [0, 120], p: [250, 360], m: sway, shapes: [] },
    ...[
      { x: 92, c: "deep" as const, m: bob },
      { x: 0, c: "gold" as const, m: { ...bob, at: 20 } },
      { x: -92, c: "main" as const, m: { ...hop, at: 40 } },
    ].flatMap(({ x, c, m }, i): Layer[] => [
      { id: `p${i}`, parent: "row", a: [x, 90], p: [x, 90], m, shapes: [] },
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
    { id: "body", a: [0, 120], p: [250, 370], m: wobble, shapes: [] },
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
    { id: "env", a: [0, 100], p: [250, 370], m: float, shapes: [] },
    { id: "card", parent: "env", a: [0, -40], p: [0, -40], m: { ...bounce, at: 20 }, shapes: [] },
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
    { id: "badge", a: [0, 120], p: [250, 370], m: hop, shapes: [] },
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
    { id: "group", a: [0, 120], p: [250, 360], m: wobble, shapes: [] },
    ...[
      { x: -100, y: 20, c: "hot" as const, at: 0 },
      { x: 100, y: 20, c: "deep" as const, at: 30 },
      { x: 0, y: -10, c: "main" as const, at: 60 },
    ].flatMap(({ x, y, c, at }, i): Layer[] => [
      { id: `m${i}`, parent: "group", a: [x, y + 110], p: [x, y + 110], m: { ...bob, at }, shapes: [] },
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
    { id: "glass", a: [40, 130], p: [250, 355], m: sway, shapes: [] },
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
    { id: "chart", a: [0, 120], p: [250, 360], m: float, shapes: [] },
    ...[
      { x: -100, h: 90, c: "tint" as const, at: 0 },
      { x: 0, h: 150, c: "main" as const, at: 20 },
      { x: 100, h: 220, c: "ok" as const, at: 40 },
    ].flatMap(({ x, h, c, at }, i): Layer[] => [
      { id: `b${i}`, parent: "chart", a: [x, 110], p: [x, 110], m: { ...bounce, at }, shapes: [] },
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
    { id: "bub", a: [0, 70], p: [250, 307], m: hop, shapes: [] },
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
    { id: "tag", a: [0, 0], p: [250, 250], m: sway, shapes: [] },
    {
      parent: "tag",
      tilt: FACE,
      shapes: [
        { d: poly([[-110, -30], [-50, -90], [110, -90], [110, 90], [-50, 90], [-110, 30]], [12, 18, 20, 20, 18, 12]), fill: "gold", depth: 1 },
        { d: ellipse(-68, 0, 15), fill: "white" },
        { d: rect(-24, -34, 110, 68, 14), fill: "white" },
        { d: line([-4, -10], [64, -10]), line: 8 },
        { d: line([-4, 12], [38, 12]), line: 8 },
      ],
    },
    glow("tag", [110, -120], 20, sparkle(60)),
  ],
};

// A gold trophy cup with a star, for "best of" lists
export const trophy: Icon = {
  name: "trophy",
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: "cup", a: [0, 130], p: [250, 380], m: hop, shapes: [] },
    {
      parent: "cup",
      tilt: FACE,
      shapes: [
        { d: rect(-80, 96, 160, 40, 10), fill: "deep", depth: 1 },
        { d: rect(-22, 40, 44, 60, 6), fill: "gold", depth: 0.8 },
        { d: ring(-104, -40, 46, 26), fill: "gold", depth: 0.6 },
        { d: ring(104, -40, 46, 26), fill: "gold", depth: 0.6 },
        { d: poly([[-104, -110], [104, -110], [84, 10], [40, 50], [-40, 50], [-84, 10]], [18, 18, 40, 20, 20, 40]), fill: "gold", depth: 1 },
        { d: star(0, -36, 40), fill: "white" },
      ],
    },
    glow("cup", [120, -140], 22, sparkle(40)),
    glow("cup", [-130, -150], 16, sparkle(110)),
  ],
};

// A horseshoe magnet pulling in little people, for leads
export const magnet: Icon = {
  name: "magnet",
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: "mag", a: [0, 40], p: [210, 315], m: sway, shapes: [] },
    {
      parent: "mag",
      tilt: FACE,
      shapes: [
        { d: poly([[-110, -120], [-50, -120], [-50, 20], [50, 20], [50, -120], [110, -120], [110, 40], [60, 100], [-60, 100], [-110, 40]], [8, 8, 30, 30, 8, 8, 60, 30, 30, 60]), fill: "hot", depth: 1 },
        { d: rect(-110, -150, 60, 40, 8), fill: "grey", depth: 1 },
        { d: rect(50, -150, 60, 40, 8), fill: "grey", depth: 1 },
      ],
    },
    ...[
      { x: 360, y: 150, c: "main" as const, at: 0 },
      { x: 390, y: 260, c: "deep" as const, at: 30 },
      { x: 355, y: 360, c: "ok" as const, at: 60 },
    ].flatMap(({ x, y, c, at }, i): Layer[] => [
      { id: `lead${i}`, a: [x, y], p: [x, y], m: { ...float, at }, shapes: [] },
      { parent: `lead${i}`, tilt: FACE, shapes: [{ d: rect(x - 26, y, 52, 50, 24), fill: c, depth: 1 }, { d: ellipse(x, y - 20, 22), fill: "tint", depth: 0.8 }] },
    ]),
  ],
};

// A phone ringing, for calls with clients
export const phone: Icon = {
  name: "phone",
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: "ph", a: [0, 150], p: [250, 405], m: wobble, shapes: [] },
    {
      parent: "ph",
      tilt: FACE,
      shapes: [
        { d: rect(-84, -160, 168, 310, 34), fill: "deep", depth: 1 },
        { d: rect(-64, -124, 128, 220, 16), fill: "white" },
        { d: ellipse(0, -60, 30), fill: "tint" },
        { d: arc(0, -56, 12, 30, 150) },
        { d: pill(-50, 20, 100, 36), fill: "ok" },
        { d: pill(-24, 118, 48, 12), fill: "grey" },
      ],
    },
    ...[0, 1].map((i): Layer => ({ parent: "ph", a: [120, -120], p: [120, -120], m: { ...twinkle(20 + i * 30) }, shapes: [{ d: arc(100, -100, 50 + i * 34, 280, 350), line: 9, round: true }] })),
  ],
};

// A video camera with a play triangle, for video meetings
export const video: Icon = {
  name: "video",
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: "cam", a: [0, 100], p: [250, 350], m: float, shapes: [] },
    {
      parent: "cam",
      tilt: FACE,
      shapes: [
        { d: poly([[90, -30], [170, -80], [170, 80], [90, 30]], [10, 14, 14, 10]), fill: "deep", depth: 1 },
        { d: rect(-150, -100, 250, 200, 36), fill: "main", depth: 1 },
        { d: poly([[-40, -50], [40, 0], [-40, 50]], 10), fill: "white" },
      ],
    },
    { id: "rec", parent: "cam", a: [-120, -70], p: [-120, -70], m: [twinkle(10), twinkle(100, true)], shapes: [{ d: ellipse(-120, -70, 14), fill: "hot" }] },
  ],
};

// A turning gear, for setup and settings
export const gear: Icon = {
  name: "gear",
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: "g", a: [0, 120], p: [250, 370], m: sway, shapes: [] },
    { id: "wheel", parent: "g", tilt: FACE, a: [0, 0], p: [0, 0], r: [[0, 0], [180, 90]], shapes: [{ d: rosette(0, 0, 118, 10, 0.5), fill: "grey", depth: 1 }, { d: ring(0, 0, 70, 34), fill: "white", depth: 0.4 }] },
    { id: "small", parent: "g", tilt: FACE, a: [130, -110], p: [130, -110], r: [[0, 0], [180, -150]], shapes: [{ d: rosette(130, -110, 56, 8, 0.5), fill: "gold", depth: 1 }, { d: ellipse(130, -110, 18), fill: "white" }] },
  ],
};

// Two arrows swapping places, for switching tools
export const swap: Icon = {
  name: "swap",
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: "top", a: [0, -60], p: [250, 220], m: { p: [[0, [0, 0]], [60, [20, 0]], [120, [0, 0]], [180, [0, 0]]] }, shapes: [] },
    { parent: "top", tilt: FACE, shapes: [{ d: poly([[-130, -90], [60, -90], [60, -130], [140, -60], [60, 10], [60, -30], [-130, -30]], [12, 6, 8, 10, 8, 6, 12]), fill: "ok", depth: 1 }] },
    { id: "bottom", a: [0, 60], p: [250, 340], m: { p: [[0, [0, 0]], [60, [-20, 0]], [120, [0, 0]], [180, [0, 0]]] }, shapes: [] },
    { parent: "bottom", tilt: FACE, shapes: [{ d: poly([[130, 30], [-60, 30], [-60, -10], [-140, 60], [-60, 130], [-60, 90], [130, 90]], [12, 6, 8, 10, 8, 6, 12]), fill: "main", depth: 1 }] },
  ],
};

// A lightning bolt badge, for head-to-head comparisons
export const versus: Icon = {
  name: "versus",
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: "v", a: [0, 120], p: [250, 370], m: hop, shapes: [] },
    { parent: "v", tilt: FACE, shapes: [{ d: rosette(0, 0, 130, 14, 0.5), fill: "hot", depth: 1 }, { d: poly([[20, -110], [-60, 20], [0, 20], [-20, 110], [60, -20], [0, -20]], 6), fill: "gold", depth: 0.6 }] },
    glow("v", [130, -130], 22, sparkle(30)),
  ],
};

// A stack of gold coins, for pricing
export const coins: Icon = {
  name: "coins",
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: "stack", a: [0, 120], p: [250, 330], m: float, shapes: [] },
    ...[0, 1, 2].map((i): Layer => ({ parent: "stack", tilt: FACE, shapes: [{ d: ellipse(-40, 80 - i * 50, 90, 90), fill: "gold", depth: 0.5 }, { d: star(-40, 80 - i * 50, 34), fill: "white" }] })),
    { id: "coin", parent: "stack", a: [120, -60], p: [120, -60], m: { ...bounce, at: 40 }, shapes: [] },
    { parent: "coin", tilt: FACE, shapes: [{ d: ellipse(120, -60, 60), fill: "gold", depth: 0.6 }, { d: star(120, -60, 24), fill: "white" }] },
  ],
};

// An inbox tray with a request card dropping in
export const inbox: Icon = {
  name: "inbox",
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: "tray", a: [0, 110], p: [250, 370], m: wobble, shapes: [] },
    { id: "card", parent: "tray", a: [0, 0], p: [0, 0], m: { p: [[0, [0, -90], [0.6, 0, 0.3, 1]], [40, [0, 0]], [150, [0, 0]], [180, [0, -90]]] }, shapes: [] },
    { parent: "card", tilt: FACE, shapes: [{ d: rect(-90, -140, 180, 120, 14), fill: "white", depth: 0.3 }, { d: line([-60, -110], [60, -110]), line: 6 }, { d: line([-60, -84], [20, -84]), line: 6 }, { d: pill(-60, -60, 70, 22), fill: "ok" }] },
    { parent: "tray", tilt: FACE, shapes: [{ d: poly([[-140, -40], [-80, -40], [-50, 10], [50, 10], [80, -40], [140, -40], [140, 90], [-140, 90]], [10, 6, 10, 10, 6, 10, 20, 20]), fill: "deep", depth: 1 }] },
  ],
};

// A calendar day struck out in red, for cancellations
export const cancelled: Icon = {
  name: "cancelled",
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: "page", a: [0, 110], p: [250, 360], m: wobble, shapes: [] },
    {
      parent: "page",
      tilt: FACE,
      shapes: [
        { d: rect(-120, -110, 240, 220, 26), fill: "white", depth: 1 },
        { d: rect(-120, -110, 240, 58, 26), fill: "hot", depth: 0.3 },
        ...[-56, 56].map((x) => ({ d: pill(x - 9, -136, 18, 50), fill: "grey" as const, depth: 0.6 })),
        { d: rect(-62, -26, 124, 104, 16), fill: "tint", depth: 0.3 },
      ],
    },
    { id: "x", parent: "page", a: [0, 26], p: [0, 26], m: { ...hop, at: 30 }, shapes: [] },
    { parent: "x", tilt: FACE, shapes: [{ d: line([-36, -10], [36, 62]), line: 16, round: true }, { d: line([36, -10], [-36, 62]), line: 16, round: true }] },
  ],
};

// A bell swinging, for reminders
export const bell: Icon = {
  name: "bell",
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: "b", a: [0, -130], p: [250, 105], r: [[0, 0, [0.4, 0, 0.6, 1]], [20, 14, [0.4, 0, 0.6, 1]], [40, -12, [0.4, 0, 0.6, 1]], [60, 8, [0.4, 0, 0.6, 1]], [80, -4, [0.4, 0, 0.6, 1]], [100, 0]], shapes: [] },
    {
      parent: "b",
      tilt: FACE,
      shapes: [
        { d: ellipse(0, 130, 30), fill: "hot", depth: 0.6 },
        { d: poly([[-40, -100], [40, -100], [90, 40], [130, 110], [-130, 110], [-90, 40]], [30, 30, 40, 12, 12, 40]), fill: "gold", depth: 1 },
        { d: ellipse(0, -118, 20), fill: "gold", depth: 0.6 },
      ],
    },
    glow("b", [140, -60], 18, sparkle(30)),
  ],
};

// A question mark in a bubble, for "is it free?" questions
export const question: Icon = {
  name: "question",
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: "q", a: [0, 120], p: [250, 370], m: hop, shapes: [] },
    {
      parent: "q",
      tilt: FACE,
      shapes: [
        { d: ellipse(0, 0, 128), fill: "deep", depth: 1 },
        { d: arc(0, -30, 44, 200, 430), line: 22, round: true },
        { d: line([0, 14], [0, 40]), line: 22, round: true },
        { d: ellipse(0, 78, 14), fill: "white" },
      ],
    },
    glow("q", [130, -120], 20, sparkle(60)),
  ],
};

// A request card with an AI summary and a "good fit" chip
export const summary: Icon = {
  name: "summary",
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: "card", a: [0, 120], p: [250, 370], m: float, shapes: [] },
    {
      parent: "card",
      tilt: FACE,
      shapes: [
        { d: rect(-140, -120, 280, 240, 26), fill: "white", depth: 1 },
        { d: ellipse(-90, -70, 26), fill: "tint" },
        { d: line([-50, -80], [80, -80]), line: 7 },
        { d: line([-50, -56], [30, -56]), line: 7 },
        { d: rect(-110, -16, 220, 70, 14), fill: "tint" },
        { d: line([-90, 6], [80, 6]), line: 6 },
        { d: line([-90, 30], [40, 30]), line: 6 },
        { d: pill(-110, 72, 110, 30), fill: "ok" },
      ],
    },
    { id: "ai", parent: "card", a: [120, -120], p: [120, -120], m: sparkle(20), shapes: [{ d: spark(120, -120, 42), fill: "gold" }] },
  ],
};

// Two arrows chasing round a circle, for round robin
export const roundrobin: Icon = {
  name: "roundrobin",
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: "rr", a: [0, 0], p: [250, 260], r: [[0, 0], [180, 360]], shapes: [] },
    { parent: "rr", shapes: [{ d: arc(0, 0, 110, 200, 340), line: 26, round: true }, { d: arc(0, 0, 110, 20, 160), line: 26, round: true }] },
    { parent: "rr", shapes: [{ d: poly([[95, -30], [150, -60], [140, 10]], 6), fill: "ok", depth: 0 }, { d: poly([[-95, 30], [-150, 60], [-140, -10]], 6), fill: "main", depth: 0 }] },
    ...[{ x: 0, y: -10, c: "deep" as const }].flatMap(({ x, y, c }): Layer[] => [
      { id: "host", parent: "rr", a: [x, y], p: [x, y], r: [[0, 0], [180, -360]], shapes: [] },
      { parent: "host", tilt: FACE, shapes: [{ d: rect(x - 40, y, 80, 70, 34), fill: c, depth: 1 }, { d: ellipse(x, y - 28, 30), fill: "tint", depth: 0.8 }] },
    ]),
  ],
};

export const STICKERS = {
  calendar, waitlist, clock, envelope, confirm, team, compare, growth, call, free,
  trophy, magnet, phone, video, gear, swap, versus, coins, inbox, cancelled, bell, question, summary, roundrobin,
} satisfies Record<string, Icon>;
export type StickerName = keyof typeof STICKERS;
