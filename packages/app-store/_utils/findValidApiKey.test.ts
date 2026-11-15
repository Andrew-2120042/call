import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const findFirst = vi.fn();
vi.mock("@calcom/prisma", () => ({
  default: { apiKey: { findFirst: (...args: unknown[]) => findFirst(...args) } },
}));

import { findValidApiKey } from "./findValidApiKey";

const hash = (value: string) => createHash("sha256").update(value).digest("hex");

describe("findValidApiKey", () => {
  beforeEach(() => {
    findFirst.mockReset();
    process.env.API_KEY_PREFIX = "cal_";
  });

  it("looks the key up without its display prefix, the way it was stored", async () => {
    await findValidApiKey("cal_abc123", "zapier");
    expect(findFirst.mock.calls[0][0].where).toMatchObject({ hashedKey: hash("abc123"), appId: "zapier" });
  });

  it("still accepts a key pasted without the prefix", async () => {
    await findValidApiKey("abc123", "make");
    expect(findFirst.mock.calls[0][0].where).toMatchObject({ hashedKey: hash("abc123"), appId: "make" });
  });
});
