import process from "node:process";
import type { CreateRegularBookingData } from "@calcom/features/bookings/lib/dto/types";
import { getPlanService } from "@calcom/features/plans/lib/getPlanService";
import { WEBAPP_URL } from "@calcom/lib/constants";
import logger from "@calcom/lib/logger";
import { prisma } from "@calcom/prisma";
import { CreationSource } from "@calcom/prisma/enums";
import { WaitlistEntryRepository } from "../repositories/WaitlistEntryRepository";
import { type CreateBookingForClaim, WaitlistService } from "../services/WaitlistService";
import { WaitlistEmailNotifier } from "./WaitlistEmailNotifier";

const log = logger.getSubLogger({ prefix: ["[waitlist]"] });

const createBookingForClaim: CreateBookingForClaim = async (params) => {
  // Loaded lazily: the booking service itself calls into the waitlist when a reschedule frees a slot.
  const { getRegularBookingService } = await import(
    "@calcom/features/bookings/di/RegularBookingService.container"
  );
  // Same shape the booking API builds from a booker's request, so claims go through every normal check.
  const bookingData: CreateRegularBookingData & { responses: Record<string, unknown> } = {
    eventTypeId: params.eventTypeId,
    start: params.startTime.toISOString(),
    end: params.endTime.toISOString(),
    timeZone: params.timeZone,
    language: params.language,
    metadata: {},
    responses: params.responses,
    creationSource: CreationSource.WEBAPP,
  };
  const booking = await getRegularBookingService().createBooking({
    bookingData,
    bookingMeta: { userId: -1, hostname: "" },
  });
  if (!booking.id || !booking.uid) throw new Error("Booking service did not return a booking");
  return { id: booking.id, uid: booking.uid, status: String(booking.status) };
};

let service: WaitlistService | null = null;

export function getWaitlistService(): WaitlistService {
  if (service) return service;
  const offerWindow = Number(process.env.WAITLIST_OFFER_WINDOW_MINUTES);
  service = new WaitlistService({
    repository: new WaitlistEntryRepository(prisma),
    notifier: new WaitlistEmailNotifier(),
    createBooking: createBookingForClaim,
    webappUrl: WEBAPP_URL,
    offerWindowMinutes: Number.isFinite(offerWindow) && offerWindow > 0 ? offerWindow : undefined,
    logger: log,
    isHostEntitled: (userId) => getPlanService().hasFeature(userId, "waitlist"),
  });
  return service;
}

/** Fire-and-forget helper for booking flows: a waitlist problem must never break a cancellation. */
export async function offerFreedSlotSafely(params: {
  eventTypeId: number | null | undefined;
  startTime: Date;
}) {
  if (!params.eventTypeId) return;
  try {
    await getWaitlistService().offerFreedSlot({
      eventTypeId: params.eventTypeId,
      startTime: params.startTime,
    });
  } catch (error) {
    log.error("Failed to offer freed slot to waitlist", { eventTypeId: params.eventTypeId, error });
  }
}
