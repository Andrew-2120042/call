const L = require("./lib.cjs"); const { APP, db, check } = L;
(async () => {
  const T = await L.start();
  const slotsOn = async (date) => { db(`delete from "SelectedSlots"`); const p = await T.person(); await p.goto(`${APP}/teampro/calendar-sync-test?date=${date}`, { timeout: 300000 }); await p.waitForSelector('[data-testid="time"]', { timeout: 120000 }); const t = await p.locator('[data-testid="time"]').evaluateAll((e) => e.map((x) => x.getAttribute("data-time"))); await p.context().close(); return t; };
  const b = await T.book("/teampro/calendar-sync-test", "Gina Calendar", `gcal+${L.RUN}@example.com`, { day: 6, time: 3 });
  const start = db(`select to_char("startTime",'YYYY-MM-DD"T"HH24:MI:SS".000Z"') from "Booking" where uid='${b.uid}'`);
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: L.TZ }).format(new Date(start));
  const ref = db(`select r.type||'|'||(length(coalesce(r.uid,''))>5) from "BookingReference" r join "Booking" b on b.id=r."bookingId" where b.uid='${b.uid}' and r.type='google_calendar'`);
  check("Booking creates an event on the Google calendar", ref === "google_calendar|true", ref);
  // Hide the booking from Slotwise's own records: only Google now knows that time is busy.
  db(`update "Booking" set status='cancelled', "idempotencyKey"=null where uid='${b.uid}'`);
  check("Slot stays blocked because Google Calendar says busy", !(await slotsOn(date)).includes(start));
  db(`update "Booking" set status='accepted' where uid='${b.uid}'`);
  await b.page.goto(`${APP}/booking/${b.uid}`, { timeout: 300000 });
  await b.page.getByTestId("cancel").click(); await b.page.getByTestId("cancel_reason").fill("Sync test done"); await b.page.getByTestId("confirm_cancel").click();
  await T.waitStatus(b.uid, "cancelled"); await b.page.waitForTimeout(6000);
  check("Cancelling removes the event, and the slot opens again", (await slotsOn(date)).includes(start));
  L.summary(); await T.browser.close(); process.exit(0);
})().catch((e) => { console.error("FATAL", e.message.split("\n")[0]); process.exit(1); });
