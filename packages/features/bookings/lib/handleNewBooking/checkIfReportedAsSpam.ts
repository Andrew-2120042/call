import { ErrorCode } from "@calcom/lib/errorCodes";
import { ErrorWithCode } from "@calcom/lib/errors";
import { extractBaseEmail } from "@calcom/lib/extract-base-email";
import prisma from "@calcom/prisma";
import { BookingReportReason } from "@calcom/prisma/enums";

/**
 * A host who reported someone as spam never gets bookings from that email again. The message stays neutral so the
 * sender doesn't learn they were reported.
 */
export async function checkIfReportedAsSpam({
  bookerEmail,
  hostUserIds,
}: {
  bookerEmail: string;
  hostUserIds: number[];
}) {
  const ids = hostUserIds.filter((id): id is number => typeof id === "number");
  if (!bookerEmail || !ids.length) return;
  const email = extractBaseEmail(bookerEmail);
  const report = await prisma.bookingReport.findFirst({
    where: {
      reportedById: { in: ids },
      reason: BookingReportReason.SPAM,
      bookerEmail: { equals: email, mode: "insensitive" },
    },
    select: { id: true },
  });
  if (report) {
    throw new ErrorWithCode(
      ErrorCode.BookerEmailBlocked,
      "This booking can't be made. Please contact the host directly."
    );
  }
}
