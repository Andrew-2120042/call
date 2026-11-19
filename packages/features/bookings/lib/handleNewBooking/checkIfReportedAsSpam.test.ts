import { describe, expect, it, vi } from "vitest";

const findFirst = vi.fn();
vi.mock("@calcom/prisma", () => ({
  default: { bookingReport: { findFirst: (...args: unknown[]) => findFirst(...args) } },
}));

import { checkIfReportedAsSpam } from "./checkIfReportedAsSpam";

describe("checkIfReportedAsSpam", () => {
  it("refuses someone the host reported as spam, matching the email loosely", async () => {
    findFirst.mockResolvedValueOnce({ id: "r1" });
    await expect(
      checkIfReportedAsSpam({ bookerEmail: "Spam@Example.com", hostUserIds: [7] })
    ).rejects.toThrow(/can't be made/);
    const where = findFirst.mock.calls[0][0].where;
    expect(where.reportedById).toEqual({ in: [7] });
    expect(where.reason).toBe("SPAM");
    expect(where.bookerEmail).toMatchObject({ mode: "insensitive" });
  });

  it("lets everyone else through", async () => {
    findFirst.mockResolvedValueOnce(null);
    await expect(
      checkIfReportedAsSpam({ bookerEmail: "client@example.com", hostUserIds: [7] })
    ).resolves.toBeUndefined();
  });

  it("does nothing without a host", async () => {
    findFirst.mockClear();
    await checkIfReportedAsSpam({ bookerEmail: "client@example.com", hostUserIds: [] });
    expect(findFirst).not.toHaveBeenCalled();
  });
});
