import { WaitlistEntryKind, WaitlistEntryStatus, WaitlistOfferMode } from "@calcom/prisma/enums";
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
  waitlistOfferMode: WaitlistOfferMode.IN_ORDER,
  owner: { name: "Jordan", email: "jordan@example.com", username: "jordan", timeZone: "America/Chicago" },
  schedulingType: null,
  team: null,
  hostUserIds: [],
};

function createFakeRepository() {
  const entries: StoredEntry[] = [];
  let nextId = 1;
  let clock = 0;
  const state = {
    slotTaken: true,
    busyHosts: undefined as number | undefined,
    eventType: { ...eventType },
    bookings: new Map<
      string,
      { startTime: Date; endTime: Date; isActive: boolean; eventTypeId: number | null }
    >(),
  };

  const repo: IWaitlistEntryRepository = {
    findEventTypeById: async (id) => (id === state.eventType.id ? state.eventType : null),
    hasBlockingBookingForHost: async () => state.slotTaken,
    countBusyHosts: async ({ userIds }: { userIds: number[] }) =>
      state.slotTaken ? (state.busyHosts ?? userIds.length) : 0,
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
        kind: WaitlistEntryKind.EXACT_TIME,
        rangeStart: null,
        rangeEnd: null,
        rescheduleBookingUid: null,
        offerStartTime: null,
        offerEndTime: null,
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
    countWaitingBefore: async ({ eventTypeId, startTime, createdAt, kind }) =>
      entries.filter(
        (e) =>
          e.eventTypeId === eventTypeId &&
          e.kind === (kind ?? WaitlistEntryKind.EXACT_TIME) &&
          e.startTime.getTime() === startTime.getTime() &&
          e.status === WaitlistEntryStatus.WAITING &&
          e.createdAt < createdAt
      ).length,
    findActiveOfferForSlot: async ({ eventTypeId, startTime, now }) =>
      entries.find(
        (e) =>
          e.eventTypeId === eventTypeId &&
          e.offerStartTime?.getTime() === startTime.getTime() &&
          e.status === WaitlistEntryStatus.OFFERED &&
          !!e.offerExpiresAt &&
          e.offerExpiresAt > now
      ) ?? null,
    findWaitingForSlot: async ({ eventTypeId, startTime, limit }) =>
      entries
        .filter((e) => {
          if (e.eventTypeId !== eventTypeId || e.status !== WaitlistEntryStatus.WAITING) return false;
          if (e.kind === WaitlistEntryKind.EXACT_TIME) return e.startTime.getTime() === startTime.getTime();
          if (e.kind === WaitlistEntryKind.ANY_TIME_ON_DAY)
            return !!e.rangeStart && !!e.rangeEnd && e.rangeStart <= startTime && e.rangeEnd > startTime;
          return !!e.rangeEnd && e.rangeEnd > startTime;
        })
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .slice(0, limit),
    findOtherOffersForSlot: async ({ eventTypeId, startTime, exceptId }) =>
      entries.filter(
        (e) =>
          e.eventTypeId === eventTypeId &&
          e.id !== exceptId &&
          e.status === WaitlistEntryStatus.OFFERED &&
          e.offerStartTime?.getTime() === startTime.getTime()
      ),
    findEarlierEntryForBooking: async ({ bookingUid }) =>
      entries.filter((e) => e.rescheduleBookingUid === bookingUid).at(-1) ?? null,
    isBookingActive: async (uid) => !!state.bookings.get(uid)?.isActive,
    findBookingForEarlierWaitlist: async (uid) => {
      const booking = state.bookings.get(uid);
      if (!booking) return null;
      return {
        uid,
        ...booking,
        responses: { goals: "Mobility" },
        attendee: { name: "Kim", email: "kim@example.com", timeZone: "UTC", locale: "en" },
      };
    },
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
        const end = e.kind === WaitlistEntryKind.EXACT_TIME ? e.startTime : e.rangeEnd;
        if (e.status === WaitlistEntryStatus.WAITING && end && end <= now) {
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

    it("team round robin: open while any host is free, taken once all are booked", async () => {
      fake.state.eventType = {
        ...fake.state.eventType,
        userId: null,
        owner: null,
        teamId: 10,
        schedulingType: "ROUND_ROBIN",
        team: { name: "Sales", ownerId: 77 },
        hostUserIds: [1, 2],
      } as WaitlistEventType;
      fake.state.busyHosts = 1;
      await expect(service.join(joinInput("a@example.com"))).rejects.toThrow(/still open/);
      fake.state.busyHosts = 2;
      expect((await service.join(joinInput("a@example.com"))).position).toBe(1);
    });

    it("team collective: taken as soon as one host is booked", async () => {
      fake.state.eventType = {
        ...fake.state.eventType,
        userId: null,
        owner: null,
        teamId: 10,
        schedulingType: "COLLECTIVE",
        team: { name: "Sales", ownerId: 77 },
        hostUserIds: [1, 2],
      } as WaitlistEventType;
      fake.state.busyHosts = 1;
      expect((await service.join(joinInput("a@example.com"))).position).toBe(1);
    });

    it("team services are paid for by the team owner's plan", async () => {
      const checked: number[] = [];
      service = new WaitlistService({
        repository: fake.repo,
        notifier,
        createBooking,
        webappUrl: "https://app.test",
        now: () => now,
        isHostEntitled: async (userId) => {
          checked.push(userId);
          return true;
        },
      });
      fake.state.eventType = {
        ...fake.state.eventType,
        userId: null,
        owner: null,
        teamId: 10,
        schedulingType: "COLLECTIVE",
        team: { name: "Sales", ownerId: 77 },
        hostUserIds: [1],
      } as WaitlistEventType;
      await service.join(joinInput("a@example.com"));
      expect(checked).toEqual([77]);
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

  describe("first come, first served", () => {
    beforeEach(() => {
      fake.state.eventType.waitlistOfferMode = WaitlistOfferMode.EVERYONE;
    });

    it("offers the time to everyone waiting at once", async () => {
      await service.join(joinInput("a@example.com"));
      await service.join(joinInput("b@example.com"));
      fake.state.slotTaken = false;
      await service.offerFreedSlot({ eventTypeId: 3, startTime: SLOT_START });
      expect(fake.entries.map((e) => e.status)).toEqual([WaitlistEntryStatus.OFFERED, WaitlistEntryStatus.OFFERED]);
      expect(notifier.sendOffer).toHaveBeenCalledTimes(2);
      expect(notifier.sendOffer.mock.calls[0][0].firstComeFirstServed).toBe(true);
    });

    it("the first to claim gets it; the others go back to waiting and their link says so", async () => {
      await service.join(joinInput("a@example.com"));
      await service.join(joinInput("b@example.com"));
      fake.state.slotTaken = false;
      await service.offerFreedSlot({ eventTypeId: 3, startTime: SLOT_START });
      const [tokenA, tokenB] = notifier.sendOffer.mock.calls.map(
        (c) => (c[0].claimUrl as string).split("/waitlist/claim/")[1]
      );

      expect(await service.claim(tokenB)).toMatchObject({ ok: true });
      expect(fake.entries[0].status).toBe(WaitlistEntryStatus.WAITING);
      expect(await service.claim(tokenA)).toEqual({ ok: false, reason: "taken_by_someone_else" });
      expect((await service.getOffer(tokenA))?.takenBySomeoneElse).toBe(true);
      expect(createBooking).toHaveBeenCalledTimes(1);
    });
  });

  describe("in order: shorter windows for times that are soon", () => {
    it("gives 30 minutes when the time is less than a day away", async () => {
      await service.join(joinInput("a@example.com"));
      fake.state.slotTaken = false;
      now = new Date(SLOT_START.getTime() - 5 * 60 * 60_000);
      await service.offerFreedSlot({ eventTypeId: 3, startTime: SLOT_START });
      expect(fake.entries[0].offerExpiresAt).toEqual(new Date(now.getTime() + 30 * 60_000));
    });
  });

  describe("any time that day", () => {
    const dayStart = new Date("2026-11-17T00:00:00.000Z");
    const dayEnd = new Date("2026-11-18T00:00:00.000Z");
    const joinDay = (email: string) =>
      service.join({ ...joinInput(email), kind: WaitlistEntryKind.ANY_TIME_ON_DAY, startTime: dayStart, endTime: dayEnd });

    it("is offered whichever time opens that day, and books that time", async () => {
      await joinDay("d@example.com");
      fake.state.slotTaken = false;
      const opening = new Date("2026-11-17T09:00:00.000Z");
      const offered = await service.offerFreedSlot({ eventTypeId: 3, startTime: opening });
      expect(offered?.email).toBe("d@example.com");
      expect(notifier.sendOffer.mock.calls[0][0].entry.startTime).toEqual(opening);

      expect(await service.claim(lastOfferToken())).toMatchObject({ ok: true });
      expect(createBooking).toHaveBeenCalledWith(
        expect.objectContaining({ startTime: opening, endTime: new Date(opening.getTime() + 30 * 60_000) })
      );
    });

    it("is not offered times on other days, and waits behind earlier exact-time joiners", async () => {
      await service.join(joinInput("a@example.com"));
      await joinDay("d@example.com");
      fake.state.slotTaken = false;
      expect(
        await service.offerFreedSlot({ eventTypeId: 3, startTime: new Date("2026-11-18T09:00:00.000Z") })
      ).toBeNull();
      expect((await service.offerFreedSlot({ eventTypeId: 3, startTime: SLOT_START }))?.email).toBe("a@example.com");
    });

    it("rejects ranges longer than a day", async () => {
      await expect(
        service.join({
          ...joinInput("d@example.com"),
          kind: WaitlistEntryKind.ANY_TIME_ON_DAY,
          startTime: dayStart,
          endTime: new Date(dayEnd.getTime() + 24 * 60 * 60_000),
        })
      ).rejects.toThrow(/single day/);
    });
  });

  describe("earlier than my booking", () => {
    const bookingStart = new Date("2026-11-20T10:00:00.000Z");
    beforeEach(() => {
      fake.state.bookings.set("bk-1", {
        startTime: bookingStart,
        endTime: new Date(bookingStart.getTime() + 30 * 60_000),
        isActive: true,
        eventTypeId: 3,
      });
    });

    it("joins from the booking and, when an earlier time opens, moves the booking there", async () => {
      const joined = await service.joinEarlier({ bookingUid: "bk-1" });
      expect(joined.entry).toMatchObject({ kind: WaitlistEntryKind.EARLIER_THAN_BOOKING, email: "kim@example.com" });
      expect((await service.joinEarlier({ bookingUid: "bk-1" })).alreadyJoined).toBe(true);

      fake.state.slotTaken = false;
      await service.offerFreedSlot({ eventTypeId: 3, startTime: SLOT_START });
      await service.claim(lastOfferToken());
      expect(createBooking).toHaveBeenCalledWith(
        expect.objectContaining({ startTime: SLOT_START, rescheduleUid: "bk-1" })
      );
    });

    it("is never offered a time at or after the booking", async () => {
      await service.joinEarlier({ bookingUid: "bk-1" });
      fake.state.slotTaken = false;
      expect(await service.offerFreedSlot({ eventTypeId: 3, startTime: bookingStart })).toBeNull();
      expect(
        await service.offerFreedSlot({ eventTypeId: 3, startTime: new Date(bookingStart.getTime() - 10 * 60_000) })
      ).toBeNull();
    });

    it("drops the entry when the booking was cancelled in the meantime", async () => {
      await service.joinEarlier({ bookingUid: "bk-1" });
      fake.state.bookings.get("bk-1")!.isActive = false;
      fake.state.slotTaken = false;
      expect(await service.offerFreedSlot({ eventTypeId: 3, startTime: SLOT_START })).toBeNull();
      expect(fake.entries[0].status).toBe(WaitlistEntryStatus.REMOVED);
    });

    it("refuses cancelled or past bookings", async () => {
      fake.state.bookings.get("bk-1")!.isActive = false;
      await expect(service.joinEarlier({ bookingUid: "bk-1" })).rejects.toThrow(/not found/);
      await expect(service.joinEarlier({ bookingUid: "nope" })).rejects.toThrow(/not found/);
    });
  });
});
