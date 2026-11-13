import { WaitlistJoinedEmail, WaitlistOfferEmail } from "@calcom/emails/templates/waitlist-email";
import { getTranslation } from "@calcom/i18n/server";
import type { WaitlistEntryRecord, WaitlistEventType } from "../repositories/WaitlistEntryRepository";
import type { IWaitlistNotifier, WaitlistOfferEmailData } from "../services/WaitlistService";

const recipientOf = (entry: WaitlistEntryRecord) => ({
  name: entry.name,
  email: entry.email,
  timeZone: entry.timeZone,
});

const hostNameOf = (eventType: WaitlistEventType) =>
  eventType.owner?.name || eventType.owner?.username || eventType.title;

export class WaitlistEmailNotifier implements IWaitlistNotifier {
  async sendJoined(params: { entry: WaitlistEntryRecord; eventType: WaitlistEventType; position: number }) {
    const t = await getTranslation(params.entry.language || "en", "common");
    await new WaitlistJoinedEmail({
      to: recipientOf(params.entry),
      hostName: hostNameOf(params.eventType),
      serviceTitle: params.eventType.title,
      startTime: params.entry.startTime,
      position: params.position,
      t,
    }).sendEmail();
  }

  async sendOffer(params: WaitlistOfferEmailData) {
    const t = await getTranslation(params.entry.language || "en", "common");
    await new WaitlistOfferEmail({
      to: recipientOf(params.entry),
      hostName: hostNameOf(params.eventType),
      serviceTitle: params.eventType.title,
      startTime: params.entry.startTime,
      claimUrl: params.claimUrl,
      offerExpiresAt: params.offerExpiresAt,
      t,
    }).sendEmail();
  }
}
