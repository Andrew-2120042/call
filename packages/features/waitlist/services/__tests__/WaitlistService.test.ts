import { WaitlistEntryStatus } from "@calcom/prisma/enums";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { hashOfferToken } from "../../lib/offerToken";
import type {
  IWaitlistEntryRepository,
  WaitlistEntryRecord,
  WaitlistEventType,
} from "../../repositories/WaitlistEntryRepository";
import { WaitlistService } from "../WaitlistService";

type StoredEntry = WaitlistEntryRecord & { offerTokenHash: string | null };

const NOW = new Date("2026-11-16T10:00:00.000Z");
const SLOT_START = new Date("2026-11-17T15:00:00.000Z");
const SLOT_END = new Date("2026-11-17T15:30:00.000Z");

const eventType: WaitlistEventType = {
  id: 3,
  title: "Coaching session",
  slug: "coaching",
  length: 30,
  userId: 4,
  teamId: null,
  waitlistEnabled: true,
  owner: { name: "Jordan", email: "jordan@example.com", username: "jordan", timeZone: "America/Chicago" },
};

function createFakeRepository() {
  const entries: StoredEntry[] = [];
  let nextId = 1;
  let clock = 0;
  const state = { slotTaken: true, eventType: { ...eventType } };

  const repo: IWaitlistEntryRepository = {
    findEventTypeById: async (id) => (id === state.eventType.id ? state.eventType : null),
    hasBlockingBookingForHost: async () => state.slotTaken,
    findByEventTypeStartAndEmail: async ({ eventTypeId, startTime, email }) =>
      entries.find(
        (e) =>
          e.eventTypeId === eventTypeId && e.startTime.getTime() === startTime.getTime() && e.email === email
      ) ?? null,
    create: async (data) => {
      const entry: StoredEntry = {
        id: nextId++,
        uid: `uid-${nextId}`,
        status: WaitlistEntryStatus.WAITING,
        offeredAt: null,
        offerExpiresAt: null,
        claimedBookingId: null,
        offerTokenHash: null,
        createdAt: new Date(NOW.getTime() + clock++),
        ...data,
        responses: data.responses as StoredEntry["responses"],
      };
      entries.push(entry);
      return entry;
    },
    rejoin: async (id, data) => {
      const entry = entries.find((e) => e.id === id);
      if (!entry) throw new Error("missing");
      Object.assign(entry, data, {
        status: WaitlistEntryStatus.WAITING,
        offerTokenHash: null,
        offeredAt: null,
        offerExpiresAt: null,
        claimedBookingId: null,
        createdAt: new Date(NOW.getTime() + clock++),
      });
      return entry;
    },
    countWaitingBefore: async ({ eventTypeId, startTime, createdAt }) =>
      entries.filter(
        (e) =>
          e.eventTypeId === eventTypeId &&
          e.startTime.getTime() === startTime.getTime() &&
          e.status === WaitlistEntryStatus.WAITING &&
          e.createdAt < createdAt
      ).length,
    findActiveOfferForSlot: async ({ eventTypeId, startTime, now }) =>
      entries.find(
        (e) =>
          e.eventTypeId === eventTypeId &&
          e.startTime.getTime() === startTime.getTime() &&
          e.status === WaitlistEntryStatus.OFFERED &&
          !!e.offerExpiresAt &&
          e.offerExpiresAt > now
      ) ?? null,
    findNextWaiting: async ({ eventTypeId, startTime }) =>
      entries
        .filter(
          (e) =>
            e.eventTypeId === eventTypeId &&
            e.startTime.getTime() === startTime.getTime() &&
            e.status === WaitlistEntryStatus.WAITING
        )
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0] ?? null,
    transition: async ({ id, from, data }) => {
      const entry = entries.find((e) => e.id === id);
      if (!entry || entry.status !== from) return false;
      Object.assign(entry, data);
      return true;
    },
    findByOfferTokenHash: async (hash) => entries.find((e) => e.offerTokenHash === hash) ?? null,
    findExpiredOffers: async (now) =>
      entries.filter(
        (e) => e.status === WaitlistEntryStatus.OFFERED && !!e.offerExpiresAt && e.offerExpiresAt <= now
      ),
    expireWaitingForPastSlots: async (now) => {
      let count = 0;
      for (const e of entries) {
        if (e.status === WaitlistEntryStatus.WAITING && e.startTime <= now) {
          e.status = WaitlistEntryStatus.EXPIRED;
          count++;
        }
      }
      return count;
    },
    findForHost: async ({ statuses }) =>
      entries
        .filter((e) => statuses.includes(e.status))
        .map((e) => ({ ...e, eventType: { id: 3, title: "Coaching session", slug: "coaching" } })),
    findByUidForHost: async ({ uid }) => entries.find((e) => e.uid === uid) ?? null,
  };
  return { repo, entries, state };
}

const joinInput = (email: string) => ({
  eventTypeId: 3,
  startTime: SLOT_START,
  endTime: SLOT_END,
  name: email.split("@")[0],
  email,
  timeZone: "America/New_York",
  language: "en",
  responses: { goals: "Promotion" },
});

describe("WaitlistService", () => {
  let fake: ReturnType<typeof createFakeRepository>;
  let notifier: { sendJoined: ReturnType<typeof vi.fn>; sendOffer: ReturnType<typeof vi.fn> };
  let createBooking: ReturnType<typeof vi.fn>;
  let now: Date;
  let service: WaitlistService;

  const lastOfferToken = () => {
    const call = notifier.sendOffer.mock.calls.at(-1);
    return (call?.[0].claimUrl as string).split("/waitlist/claim/")[1];
  };

  beforeEach(() => {
    fake = createFakeRepository();
    notifier = {
      sendJoined: vi.fn().mockResolvedValue(undefined),
      sendOffer: vi.fn().mockResolvedValue(undefined),
    };
    createBooking = vi.fn().mockResolvedValue({ id: 99, uid: "booking-uid", status: "ACCEPTED" });
    now = new Date(NOW);
    service = new WaitlistService({
      repository: fake.repo,
      notifier,
      createBooking,
      webappUrl: "https://app.test",
      now: () => now,
      offerWindowMinutes: 120,
    });
  });

  describe("join", () => {
    it("adds people in order and tells them their position", async () => {
      const first = await service.join(joinInput("a@example.com"));
      const second = await service.join(joinInput("b@example.com"));
      expect(first.position).toBe(1);
      expect(second.position).toBe(2);
      expect(notifier.sendJoined).toHaveBeenCalledTimes(2);
      expect(fake.entries[0].responses).toMatchObject({ goals: "Promotion", email: "a@example.com" });
    });

    it("is idempotent for the same person and slot", async () => {
      await service.join(joinInput("a@example.com"));
      const again = await service.join(joinInput("A@Example.com"));
      expect(again.alreadyJoined).toBe(true);
      expect(fake.entries).toHaveLength(1);
      expect(notifier.sendJoined).toHaveBeenCalledTimes(1);
    });

    it("rejects joining when the slot is still free", async () => {
      fake.state.slotTaken = false;
      await expect(service.join(joinInput("a@example.com"))).rejects.toThrow(/still open/);
    });

    it("rejects services without a waitlist, wrong lengths and past slots", async () => {
      fake.state.eventType.waitlistEnabled = false;
      await expect(service.join(joinInput("a@example.com"))).rejects.toThrow(/doesn't have a waitlist/);
      fake.state.eventType.waitlistEnabled = true;
      await expect(
        service.join({ ...joinInput("a@example.com"), endTime: new Date(SLOT_END.getTime() + 60_000) })
      ).rejects.toThrow(/30 minutes/);
      now = new Date(SLOT_START.getTime() + 1);
      await expect(service.join(joinInput("a@example.com"))).rejects.toThrow(/passed/);
    });

    it("puts someone who rejoins after being removed at the back of the queue", async () => {
      const first = await service.join(joinInput("a@example.com"));
      await service.join(joinInput("b@example.com"));
      await service.removeForHost({ userId: 4, uid: first.entry.uid });
      const rejoined = await service.join(joinInput("a@example.com"));
      expect(rejoined.position).toBe(2);
    });

    it("refuses joins and offers when the host's plan no longer includes the waitlist", async () => {
      const entitled = { value: true };
      service = new WaitlistService({
        repository: fake.repo,
        notifier,
        createBooking,
        webappUrl: "https://app.test",
        now: () => now,
        isHostEntitled: async () => entitled.value,
      });
      await service.join(joinInput("a@example.com"));
      entitled.value = false;
      await expect(service.join(joinInput("b@example.com"))).rejects.toThrow(/doesn't have a waitlist/);
      fake.state.slotTaken = false;
      expect(await service.offerFreedSlot({ eventTypeId: 3, startTime: SLOT_START })).toBeNull();
    });

    it("still succeeds when the confirmation email fails", async () => {
      notifier.sendJoined.mockRejectedValueOnce(new Error("smtp down"));
      await expect(service.join(joinInput("a@example.com"))).resolves.toMatchObject({ position: 1 });
    });
  });

  describe("offerFreedSlot", () => {
    it("offers the slot to the earliest waiting person with a single-use link", async () => {
      await service.join(joinInput("a@example.com"));
      await service.join(joinInput("b@example.com"));
      fake.state.slotTaken = false;

      const offered = await service.offerFreedSlot({ eventTypeId: 3, startTime: SLOT_START });

      expect(offered?.email).toBe("a@example.com");
      expect(fake.entries[0].status).toBe(WaitlistEntryStatus.OFFERED);
      expect(fake.entries[0].offerTokenHash).toBe(hashOfferToken(lastOfferToken()));
      expect(fake.entries[0].offerExpiresAt).toEqual(new Date(NOW.getTime() + 120 * 60_000));
    });

    it("does not offer twice while an offer is open", async () => {
      await service.join(joinInput("a@example.com"));
      await service.join(joinInput("b@example.com"));
      fake.state.slotTaken = false;
      await service.offerFreedSlot({ eventTypeId: 3, startTime: SLOT_START });
      const second = await service.offerFreedSlot({ eventTypeId: 3, startTime: SLOT_START });
      expect(second).toBeNull();
      expect(notifier.sendOffer).toHaveBeenCalledTimes(1);
    });

    it("does nothing when the slot is still taken or already in the past", async () => {
      await service.join(joinInput("a@example.com"));
      expect(await service.offerFreedSlot({ eventTypeId: 3, startTime: SLOT_START })).toBeNull();
      fake.state.slotTaken = false;
      now = new Date(SLOT_START.getTime() + 1);
      expect(await service.offerFreedSlot({ eventTypeId: 3, startTime: SLOT_START })).toBeNull();
    });

    it("caps the offer window at the slot start time", async () => {
      await service.join(joinInput("a@example.com"));
      fake.state.slotTaken = false;
      now = new Date(SLOT_START.getTime() - 30 * 60_000);
      await service.offerFreedSlot({ eventTypeId: 3, startTime: SLOT_START });
      expect(fake.entries[0].offerExpiresAt).toEqual(SLOT_START);
    });
  });

  describe("processExpirations", () => {
    it("expires a stale offer and passes the slot to the next person", async () => {
      await service.join(joinInput("a@example.com"));
      await service.join(joinInput("b@example.com"));
      fake.state.slotTaken = false;
      await service.offerFreedSlot({ eventTypeId: 3, startTime: SLOT_START });

      now = new Date(NOW.getTime() + 121 * 60_000);
      const result = await service.processExpirations();

      expect(result).toMatchObject({ offersExpired: 1, reoffered: 1 });
      expect(fake.entries[0].status).toBe(WaitlistEntryStatus.EXPIRED);
      expect(fake.entries[1].status).toBe(WaitlistEntryStatus.OFFERED);
    });

    it("expires people waiting for slots that already started", async () => {
      await service.join(joinInput("a@example.com"));
      now = new Date(SLOT_START.getTime() + 60_000);
      expect((await service.processExpirations()).pastSlotsExpired).toBe(1);
    });
  });

  describe("claim", () => {
    const offerToFirst = async () => {
      await service.join(joinInput("a@example.com"));
      fake.state.slotTaken = false;
      await service.offerFreedSlot({ eventTypeId: 3, startTime: SLOT_START });
      return lastOfferToken();
    };

    it("books the slot with the saved answers through the normal booking flow", async () => {
      const token = await offerToFirst();
      const result = await service.claim(token);

      expect(result).toEqual({ ok: true, bookingUid: "booking-uid", bookingStatus: "ACCEPTED" });
      expect(createBooking).toHaveBeenCalledWith(
        expect.objectContaining({
          eventTypeId: 3,
          startTime: SLOT_START,
          endTime: SLOT_END,
          responses: expect.objectContaining({ goals: "Promotion", email: "a@example.com" }),
        })
      );
      expect(fake.entries[0]).toMatchObject({ status: WaitlistEntryStatus.CLAIMED, claimedBookingId: 99 });
    });

    it("cannot be claimed twice", async () => {
      const token = await offerToFirst();
      await service.claim(token);
      expect(await service.claim(token)).toEqual({ ok: false, reason: "invalid" });
      expect(createBooking).toHaveBeenCalledTimes(1);
    });

    it("blocks a concurrent second claim of the same offer", async () => {
      const token = await offerToFirst();
      const [first, second] = await Promise.all([service.claim(token), service.claim(token)]);
      expect([first.ok, second.ok].filter(Boolean)).toHaveLength(1);
      expect(createBooking).toHaveBeenCalledTimes(1);
    });

    it("rejects expired, malformed and unknown links", async () => {
      const token = await offerToFirst();
      expect(await service.claim("not-a-token")).toEqual({ ok: false, reason: "invalid" });
      expect(await service.claim("A".repeat(43))).toEqual({ ok: false, reason: "invalid" });
      now = new Date(NOW.getTime() + 121 * 60_000);
      expect(await service.claim(token)).toEqual({ ok: false, reason: "expired" });
    });

    it("keeps the person's place when the slot was taken before they claimed", async () => {
      const token = await offerToFirst();
      createBooking.mockRejectedValueOnce(new Error("no_available_users_found_error"));
      expect(await service.claim(token)).toEqual({ ok: false, reason: "slot_unavailable" });
      expect(fake.entries[0]).toMatchObject({ status: WaitlistEntryStatus.WAITING, offerTokenHash: null });
    });
  });

  describe("removeForHost", () => {
    it("re-offers the slot when the removed person was holding the offer", async () => {
      await service.join(joinInput("a@example.com"));
      await service.join(joinInput("b@example.com"));
      fake.state.slotTaken = false;
      await service.offerFreedSlot({ eventTypeId: 3, startTime: SLOT_START });

      await service.removeForHost({ userId: 4, uid: fake.entries[0].uid });

      expect(fake.entries[0].status).toBe(WaitlistEntryStatus.REMOVED);
      expect(fake.entries[1].status).toBe(WaitlistEntryStatus.OFFERED);
    });

    it("throws for entries that don't exist", async () => {
      await expect(service.removeForHost({ userId: 4, uid: "missing" })).rejects.toThrow(/not found/);
    });
  });
});
