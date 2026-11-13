import type { PrismaClient } from "@calcom/prisma";
import type { Prisma } from "@calcom/prisma/client";
import { BookingStatus, WaitlistEntryStatus } from "@calcom/prisma/enums";

const entrySelect = {
  id: true,
  uid: true,
  eventTypeId: true,
  startTime: true,
  endTime: true,
  name: true,
  email: true,
  timeZone: true,
  language: true,
  responses: true,
  status: true,
  offeredAt: true,
  offerExpiresAt: true,
  claimedBookingId: true,
  createdAt: true,
} satisfies Prisma.WaitlistEntrySelect;

export type WaitlistEntryRecord = Prisma.WaitlistEntryGetPayload<{ select: typeof entrySelect }>;

export type WaitlistEventType = {
  id: number;
  title: string;
  slug: string;
  length: number;
  userId: number | null;
  teamId: number | null;
  waitlistEnabled: boolean;
  owner: { name: string | null; email: string; username: string | null; timeZone: string } | null;
};

// A slot is "taken" when the host already has a confirmed booking overlapping it.
const SLOT_BLOCKING_STATUSES = [BookingStatus.ACCEPTED, BookingStatus.AWAITING_HOST];

export class WaitlistEntryRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  async findEventTypeById(eventTypeId: number): Promise<WaitlistEventType | null> {
    const eventType = await this.prismaClient.eventType.findUnique({
      where: { id: eventTypeId },
      select: {
        id: true,
        title: true,
        slug: true,
        length: true,
        userId: true,
        teamId: true,
        waitlistEnabled: true,
        owner: { select: { name: true, email: true, username: true, timeZone: true } },
      },
    });
    return eventType;
  }

  async hasBlockingBookingForHost(params: { userId: number; startTime: Date; endTime: Date }) {
    const count = await this.prismaClient.booking.count({
      where: {
        userId: params.userId,
        status: { in: SLOT_BLOCKING_STATUSES },
        startTime: { lt: params.endTime },
        endTime: { gt: params.startTime },
      },
    });
    return count > 0;
  }

  async findByEventTypeStartAndEmail(params: { eventTypeId: number; startTime: Date; email: string }) {
    return this.prismaClient.waitlistEntry.findUnique({
      where: { eventTypeId_startTime_email: params },
      select: entrySelect,
    });
  }

  async create(data: {
    eventTypeId: number;
    startTime: Date;
    endTime: Date;
    name: string;
    email: string;
    timeZone: string;
    language: string;
    responses: Prisma.InputJsonValue;
  }) {
    return this.prismaClient.waitlistEntry.create({ data, select: entrySelect });
  }

  async rejoin(
    id: number,
    data: { name: string; timeZone: string; language: string; responses: Prisma.InputJsonValue }
  ) {
    return this.prismaClient.waitlistEntry.update({
      where: { id },
      data: {
        ...data,
        status: WaitlistEntryStatus.WAITING,
        offerTokenHash: null,
        offeredAt: null,
        offerExpiresAt: null,
        claimedBookingId: null,
        createdAt: new Date(),
      },
      select: entrySelect,
    });
  }

  async countWaitingBefore(params: { eventTypeId: number; startTime: Date; createdAt: Date }) {
    return this.prismaClient.waitlistEntry.count({
      where: {
        eventTypeId: params.eventTypeId,
        startTime: params.startTime,
        status: WaitlistEntryStatus.WAITING,
        createdAt: { lt: params.createdAt },
      },
    });
  }

  async findActiveOfferForSlot(params: { eventTypeId: number; startTime: Date; now: Date }) {
    return this.prismaClient.waitlistEntry.findFirst({
      where: {
        eventTypeId: params.eventTypeId,
        startTime: params.startTime,
        status: WaitlistEntryStatus.OFFERED,
        offerExpiresAt: { gt: params.now },
      },
      select: entrySelect,
    });
  }

  async findNextWaiting(params: { eventTypeId: number; startTime: Date }) {
    return this.prismaClient.waitlistEntry.findFirst({
      where: {
        eventTypeId: params.eventTypeId,
        startTime: params.startTime,
        status: WaitlistEntryStatus.WAITING,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: entrySelect,
    });
  }

  /** Conditional transition so two workers can never offer or claim the same entry twice. */
  async transition(params: {
    id: number;
    from: WaitlistEntryStatus;
    data: Prisma.WaitlistEntryUpdateManyMutationInput;
  }): Promise<boolean> {
    const result = await this.prismaClient.waitlistEntry.updateMany({
      where: { id: params.id, status: params.from },
      data: params.data,
    });
    return result.count === 1;
  }

  async findByOfferTokenHash(offerTokenHash: string) {
    return this.prismaClient.waitlistEntry.findUnique({
      where: { offerTokenHash },
      select: entrySelect,
    });
  }

  async findExpiredOffers(now: Date) {
    return this.prismaClient.waitlistEntry.findMany({
      where: { status: WaitlistEntryStatus.OFFERED, offerExpiresAt: { lte: now } },
      select: entrySelect,
      take: 500,
    });
  }

  async expireWaitingForPastSlots(now: Date) {
    const result = await this.prismaClient.waitlistEntry.updateMany({
      where: { status: WaitlistEntryStatus.WAITING, startTime: { lte: now } },
      data: { status: WaitlistEntryStatus.EXPIRED },
    });
    return result.count;
  }

  async findForHost(params: { userId: number; statuses: WaitlistEntryStatus[]; from: Date }) {
    return this.prismaClient.waitlistEntry.findMany({
      where: {
        eventType: { userId: params.userId },
        status: { in: params.statuses },
        startTime: { gte: params.from },
      },
      orderBy: [{ startTime: "asc" }, { createdAt: "asc" }],
      select: { ...entrySelect, eventType: { select: { id: true, title: true, slug: true } } },
      take: 500,
    });
  }

  async findByUidForHost(params: { uid: string; userId: number }) {
    return this.prismaClient.waitlistEntry.findFirst({
      where: { uid: params.uid, eventType: { userId: params.userId } },
      select: entrySelect,
    });
  }
}

export type IWaitlistEntryRepository = Pick<
  WaitlistEntryRepository,
  | "findEventTypeById"
  | "hasBlockingBookingForHost"
  | "findByEventTypeStartAndEmail"
  | "create"
  | "rejoin"
  | "countWaitingBefore"
  | "findActiveOfferForSlot"
  | "findNextWaiting"
  | "transition"
  | "findByOfferTokenHash"
  | "findExpiredOffers"
  | "expireWaitingForPastSlots"
  | "findForHost"
  | "findByUidForHost"
>;
