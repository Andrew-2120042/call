import { describe, expect, it, vi } from "vitest";
import { FeedbackService } from "../FeedbackService";

const sender = { id: 4, name: "Pro", email: "pro@example.com", username: "pro" };
const make = (overrides: { count?: number; send?: () => Promise<void>; found?: typeof sender | null } = {}) => {
  const repository = {
    create: vi.fn(async () => ({ id: 1 })),
    countSince: vi.fn(async () => overrides.count ?? 0),
    findSender: vi.fn(async () => (overrides.found === undefined ? sender : overrides.found)),
  };
  const sendToSupport = vi.fn(overrides.send ?? (async () => {}));
  return { repository, sendToSupport, service: new FeedbackService({ repository, sendToSupport }) };
};

describe("FeedbackService", () => {
  it("saves the message and emails support with the sender's details", async () => {
    const { service, repository, sendToSupport } = make();
    await service.submit({ userId: 4, kind: "problem", message: "  The calendar is off by an hour  ", page: "/home" });
    expect(repository.create).toHaveBeenCalledWith({ userId: 4, kind: "problem", message: "The calendar is off by an hour" });
    expect(sendToSupport).toHaveBeenCalledWith(expect.objectContaining({ kind: "problem", page: "/home", sender }));
  });

  it("still saves when the email fails", async () => {
    const { service, repository } = make({ send: async () => Promise.reject(new Error("smtp down")) });
    await expect(service.submit({ userId: 4, kind: "feedback", message: "Love it" })).resolves.toEqual({ id: 1 });
    expect(repository.create).toHaveBeenCalledTimes(1);
  });

  it("refuses empty messages, unknown accounts and more than 20 a day", async () => {
    await expect(make().service.submit({ userId: 4, kind: "feedback", message: " " })).rejects.toThrow(/few words/);
    await expect(make({ found: null }).service.submit({ userId: 9, kind: "feedback", message: "hello" })).rejects.toThrow(/not found/);
    const full = make({ count: 20 });
    await expect(full.service.submit({ userId: 4, kind: "feedback", message: "hello" })).rejects.toThrow(/tomorrow/);
    expect(full.repository.create).not.toHaveBeenCalled();
  });
});
