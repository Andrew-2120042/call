// Calbee on Zapier. Calbee's side lives in packages/app-store/zapier: people create an API key on the Zapier setup page
// in Calbee, Zapier subscribes to booking events with it, and Calbee posts each event to the Zap's hook URL.
const { version } = require("./package.json");
const { version: platformVersion } = require("zapier-platform-core");

const BASE = process.env.CALBEE_APP_URL || "https://app.nodslot.site";
const API = `${BASE}/api/integrations/zapier`;

const authentication = {
  type: "custom",
  fields: [
    {
      key: "apiKey",
      label: "Calbee API key",
      required: true,
      type: "password",
      helpText: "In Calbee, open **Apps → Zapier** and create a key, then paste it here. [How to get a key](https://nodslot.site/docs/developers).",
    },
  ],
  test: async (z) => {
    const response = await z.request({ url: `${API}/me` });
    return response.data;
  },
  connectionLabel: "{{username}}",
};

const addApiKey = (request, z, bundle) => {
  request.params = { ...(request.params || {}), apiKey: bundle.authData.apiKey };
  return request;
};

// Zapier subscriptions receive the booking itself (older webhooks wrap it in { triggerEvent, payload }); either way
// the Zap gets the booking with a stable id.
const toBooking = (event) => {
  const booking = event && event.payload ? event.payload : event || {};
  return {
    id: booking.uid || booking.bookingId || event.createdAt || String(Date.now()),
    triggerEvent: event.triggerEvent,
    ...booking,
  };
};

const SAMPLE = {
  id: "8b7c0cc1-484f-45e5-b30f-820045b707e1",
  triggerEvent: "BOOKING_CREATED",
  title: "Intro call between Alex Morgan and Sam Lee",
  type: "intro-call",
  startTime: "2026-12-01T10:00:00.000Z",
  endTime: "2026-12-01T10:30:00.000Z",
  organizer: { name: "Alex Morgan", email: "alex@example.com", timeZone: "Europe/London" },
  attendees: [{ name: "Sam Lee", email: "sam@example.com", timeZone: "America/New_York" }],
  location: "integrations:google:meet",
  status: "ACCEPTED",
  responses: { notes: { label: "Additional notes", value: "Looking forward to it" } },
};

const makeTrigger = ({ key, event, noun, label, description }) => ({
  key,
  noun,
  display: { label, description },
  operation: {
    type: "hook",
    performSubscribe: async (z, bundle) => {
      const response = await z.request({
        url: `${API}/addSubscription`,
        method: "POST",
        body: { subscriberUrl: bundle.targetUrl, triggerEvent: event },
      });
      return response.data;
    },
    performUnsubscribe: async (z, bundle) => {
      const response = await z.request({
        url: `${API}/deleteSubscription`,
        method: "DELETE",
        params: { id: bundle.subscribeData.id },
      });
      return response.data || {};
    },
    perform: (z, bundle) => {
      const booking = toBooking(bundle.cleanedRequest);
      return [{ ...booking, triggerEvent: booking.triggerEvent || event }];
    },
    performList: async (z) => {
      const response = await z.request({ url: `${API}/listBookings` });
      const items = Array.isArray(response.data) ? response.data : [];
      return items.map((item) => toBooking({ triggerEvent: event, payload: item }));
    },
    sample: { ...SAMPLE, triggerEvent: event },
  },
});

const triggers = [
  makeTrigger({ key: "booking_created", event: "BOOKING_CREATED", noun: "Booking", label: "New Booking", description: "Triggers when someone books a time with you." }),
  makeTrigger({ key: "booking_requested", event: "BOOKING_REQUESTED", noun: "Request", label: "New Booking Request", description: "Triggers when someone requests a time that needs your approval." }),
  makeTrigger({ key: "booking_rescheduled", event: "BOOKING_RESCHEDULED", noun: "Booking", label: "Booking Rescheduled", description: "Triggers when a booking moves to a new time." }),
  makeTrigger({ key: "booking_cancelled", event: "BOOKING_CANCELLED", noun: "Booking", label: "Booking Cancelled", description: "Triggers when a booking is cancelled." }),
  makeTrigger({ key: "meeting_ended", event: "MEETING_ENDED", noun: "Meeting", label: "Meeting Ended", description: "Triggers when a booked meeting has ended." }),
];

module.exports = {
  version,
  platformVersion,
  authentication,
  beforeRequest: [addApiKey],
  // Booking payloads are passed through exactly as Calbee sends them.
  flags: { cleanInputData: false },
  triggers: Object.fromEntries(triggers.map((trigger) => [trigger.key, trigger])),
};
