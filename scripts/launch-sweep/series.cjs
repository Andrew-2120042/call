// A weekly series whose week 3 is already taken must book nothing and say which week clashes.
// Run: node scripts/launch-sweep/series.cjs  (local app on :3000, test data from the seed)
const { APP, db, check, summary } = require("./lib.cjs");
const crypto = require("crypto");

(async () => {
  const proId = db(`select id from users where email='pro@example.com'`);
  const eventTypeId = 11; // Yoga class: weekly, no required questions, no approval
  // Next Monday at least 4 days out, 10:00 in Kolkata (04:30 UTC): inside the seeded Mon–Fri 9–5 hours.
  const d = new Date(); d.setUTCDate(d.getUTCDate() + 4); while (d.getUTCDay() !== 1) d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(4, 30, 0, 0);
  const weeks = [0, 1, 2, 3].map((w) => new Date(d.getTime() + w * 7 * 86400000));
  const iso = (t) => t.toISOString();
  const end = (t) => new Date(t.getTime() + 30 * 60000);
  const tag = `series-test-${Date.now()}`;

  // Clear anything at these times, then put an ordinary booking in week 3.
  db(`update "Booking" set status='cancelled', "idempotencyKey"=null where "userId"=${proId} and status in ('accepted','pending') and "startTime" in (${weeks.map((w) => `'${iso(w)}'`).join(",")})`);
  db(`insert into "Booking" (uid, title, "startTime", "endTime", "userId", "eventTypeId", status) values ('${tag}-blocker', 'Series test blocker', '${iso(weeks[2])}', '${iso(end(weeks[2]))}', ${proId}, 3, 'accepted')`);

  const recurringEventId = crypto.randomUUID();
  const body = weeks.map((w) => ({
    responses: { name: "Series Test", email: `${tag}@example.com`, location: { value: "", optionValue: "" } },
    user: "pro", eventTypeId, eventTypeSlug: "yoga-class", timeZone: "Asia/Calcutta", language: "en", metadata: {},
    start: iso(w), end: iso(end(w)), recurringEventId, recurringCount: 4, hasHashedBookingLink: false,
  }));
  const res = await fetch(`${APP}/api/book/recurring-event`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const text = await res.text();
  const saved = db(`select count(*) from "Booking" where "recurringEventId"='${recurringEventId}'`);
  check("Series with a taken week is refused", res.status >= 400, `${res.status} ${text.slice(0, 160)}`);
  check("The error names the clashing week", /recurring_week_unavailable_error/.test(text) && /"week":3/.test(text), text.slice(0, 200));
  check("Nothing from the series was saved (not even week 1)", saved === "0", `${saved} saved`);

  // Free week 3 and book again: the whole series should go through.
  db(`update "Booking" set status='cancelled', "idempotencyKey"=null where uid='${tag}-blocker'`);
  const res2 = await fetch(`${APP}/api/book/recurring-event`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body.map((b) => ({ ...b, recurringEventId: crypto.randomUUID() === "" ? "" : recurringEventId + "-2" }))) });
  const saved2 = db(`select count(*) from "Booking" where "recurringEventId"='${recurringEventId}-2' and status in ('accepted','pending')`);
  check("Once week 3 is free, all 4 weeks are booked", res2.status === 200 && saved2 === "4", `${res2.status} ${saved2} saved`);

  // Clean up.
  db(`update "Booking" set status='cancelled', "idempotencyKey"=null where "recurringEventId" like '${recurringEventId}%'`);
  db(`delete from "Booking" where uid='${tag}-blocker'`);
  summary();
})();
