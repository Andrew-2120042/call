import { describe, expect, it } from "vitest";
import { addBreakToDay, addBreakToWeek } from "./lunch-break";

const t = (h: number, m = 0) => new Date(Date.UTC(1970, 0, 1, h, m));
const range = (sh: number, eh: number, sm = 0, em = 0) => ({ start: t(sh, sm), end: t(eh, em) });
const hours = (ranges: { start: Date; end: Date }[]) =>
  ranges.map((r) => `${r.start.getUTCHours()}:${String(r.start.getUTCMinutes()).padStart(2, "0")}-${r.end.getUTCHours()}:${String(r.end.getUTCMinutes()).padStart(2, "0")}`);

describe("addBreakToDay", () => {
  it("splits a working day around a 1–2pm lunch break", () => {
    expect(hours(addBreakToDay([range(9, 17)], 13 * 60, 14 * 60))).toEqual(["9:00-13:00", "14:00-17:00"]);
  });
  it("trims a range that only overlaps the break", () => {
    expect(hours(addBreakToDay([range(9, 13, 0, 30)], 13 * 60, 14 * 60))).toEqual(["9:00-13:00"]);
    expect(hours(addBreakToDay([range(13, 17, 30)], 13 * 60, 14 * 60))).toEqual(["14:00-17:00"]);
  });
  it("removes a range entirely inside the break and keeps ranges outside it", () => {
    expect(hours(addBreakToDay([range(9, 12), range(13, 14), range(15, 17)], 13 * 60, 14 * 60))).toEqual(["9:00-12:00", "15:00-17:00"]);
  });
  it("supports a custom break such as 12:30–1:15", () => {
    expect(hours(addBreakToDay([range(9, 17)], 12 * 60 + 30, 13 * 60 + 15))).toEqual(["9:00-12:30", "13:15-17:00"]);
  });
  it("ignores a break that ends before it starts", () => {
    expect(hours(addBreakToDay([range(9, 17)], 14 * 60, 13 * 60))).toEqual(["9:00-17:00"]);
  });
});

describe("addBreakToWeek", () => {
  it("adds the break to working days and leaves days off empty", () => {
    const week = addBreakToWeek([[], [range(9, 17)], [range(9, 17)], [], [], [], []], 13 * 60, 14 * 60);
    expect(week[0]).toEqual([]);
    expect(hours(week[1])).toEqual(["9:00-13:00", "14:00-17:00"]);
    expect(hours(week[2])).toEqual(["9:00-13:00", "14:00-17:00"]);
  });
});
