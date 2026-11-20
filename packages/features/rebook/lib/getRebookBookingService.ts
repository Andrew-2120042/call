import type { CreateRegularBookingData } from "@calcom/features/bookings/lib/dto/types";
import { prisma } from "@calcom/prisma";
import { CreationSource } from "@calcom/prisma/enums";
import { RebookRepository } from "../repositories/RebookRepository";
import { type CreateRebooking, RebookBookingService } from "../services/RebookBookingService";

const createRebooking: CreateRebooking = async (params) => {
  // Loaded lazily: the booking service imports code that reaches back into rebooking on cancel.
  const { getRegularBookingService } = await import(
    "@calcom/features/bookings/di/RegularBookingService.container"
  );
  const bookingData: CreateRegularBookingData & { responses: Record<string, unknown> } = {
    eventTypeId: params.eventTypeId,
    eventTypeSlug: params.eventTypeSlug,
    start: params.start.toISOString(),
    end: params.end.toISOString(),
    timeZone: params.timeZone,
    language: params.language,
    user: params.username ?? undefined,
    metadata: {},
    responses: params.responses,
    creationSource: CreationSource.WEBAPP,
  };
  const booking = await getRegularBookingService().createBooking({
    bookingData,
    bookingMeta: { userId: -1, hostname: "" },
  });
  if (!booking.uid) throw new Error("Booking service did not return a booking");
  return { uid: booking.uid };
};

let service: RebookBookingService | null = null;

export function getRebookBookingService(): RebookBookingService {
  if (service) return service;
  service = new RebookBookingService({ repository: new RebookRepository(prisma), createBooking: createRebooking });
  return service;
}
