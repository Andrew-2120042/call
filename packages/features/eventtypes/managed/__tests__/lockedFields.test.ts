import { describe, expect, it } from "vitest";
import { lockedFieldsInUpdate } from "../lockedFields";

describe("lockedFieldsInUpdate", () => {
  it("flags template-controlled fields a member tries to change", () => {
    expect(lockedFieldsInUpdate({ title: "Mine", length: 45, locations: [] })).toEqual(["title", "length"]);
  });
  it("allows the fields members own, and ignores undefined values", () => {
    expect(
      lockedFieldsInUpdate({ locations: [{ type: "zoom" }], schedule: 3, hidden: true, title: undefined })
    ).toEqual([]);
  });
});
