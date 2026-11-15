const { endpoint } = require("../lib");

/** One REST-hook trigger per booking event; Slotwise calls Zapier's URL the moment it happens. */
const makeTrigger = ({ key, event, noun, label, description }) => ({
  key,
  noun,
  display: { label, description },
  operation: {
    type: "hook",
    performSubscribe: async (z, bundle) => {
      const response = await z.request({
        url: endpoint("addSubscription"),
        method: "POST",
        params: { apiKey: bundle.authData.apiKey },
        body: { subscriberUrl: bundle.targetUrl, triggerEvent: event },
      });
      response.throwForStatus();
      return response.data;
    },
    performUnsubscribe: async (z, bundle) => {
      const response = await z.request({
        url: endpoint("deleteSubscription"),
        method: "DELETE",
        params: { apiKey: bundle.authData.apiKey, id: bundle.subscribeData.id },
      });
      response.throwForStatus();
      return response.data;
    },
    perform: (z, bundle) => [bundle.cleanedRequest],
    // Recent real bookings, so people can map fields while setting up their Zap.
    performList: async (z, bundle) => {
      const response = await z.request({ url: endpoint("listBookings"), params: { apiKey: bundle.authData.apiKey } });
      response.throwForStatus();
      return (response.data || []).map((booking) => ({ ...booking, id: booking.id ?? booking.uid }));
    },
    sample: {
      id: 1,
      uid: "bFJeNb2uX8ANpT3JL5EfXw",
      title: "Intro call between Maya Patel and Sam Lee",
      startTime: "2026-11-17T09:30:00.000Z",
      endTime: "2026-11-17T09:45:00.000Z",
      status: "ACCEPTED",
      location: "Google Meet",
      attendees: [{ name: "Sam Lee", email: "sam@example.com", timeZone: "Europe/London" }],
      organizer: { name: "Maya Patel", email: "maya@example.com", timeZone: "Europe/London" },
      responses: { notes: { label: "Additional notes", value: "Looking forward to it" } },
    },
  },
});

module.exports = {
  created: makeTrigger({ key: "booking_created", event: "BOOKING_CREATED", noun: "Booking", label: "New Booking", description: "Triggers when someone books a service." }),
  requested: makeTrigger({ key: "booking_requested", event: "BOOKING_REQUESTED", noun: "Booking Request", label: "New Booking Request", description: "Triggers when someone requests a service that needs your approval." }),
  rescheduled: makeTrigger({ key: "booking_rescheduled", event: "BOOKING_RESCHEDULED", noun: "Booking", label: "Booking Rescheduled", description: "Triggers when a booking is moved to a new time." }),
  cancelled: makeTrigger({ key: "booking_cancelled", event: "BOOKING_CANCELLED", noun: "Booking", label: "Booking Cancelled", description: "Triggers when a booking is cancelled." }),
};
