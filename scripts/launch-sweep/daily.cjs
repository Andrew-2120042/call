const L = require("./lib.cjs");
(async () => {
  const T = await L.start(); const since = Date.now();
  const b = await T.book("/pro/discovery-call", "Vera Video", `vera+${L.RUN}@example.com`, { day: 5, time: 3 });
  const ref = L.db(`select r.type||'|'||coalesce(r."meetingUrl",'') from "BookingReference" r join "Booking" b on b.id=r."bookingId" where b.uid='${b.uid}'`);
  L.check("Booking gets a Daily video room", /daily_video\|https:\/\/slotwise\.daily\.co\//.test(ref), ref.replace(/\/[\w-]+$/, "/…"));
  const m = await L.findMail(`vera+${L.RUN}@example.com`, since);
  L.check("Client's email has the meeting link", /slotwise\.daily\.co|\/video\//.test(m?.raw || ""));
  const err = await L.findMail("pro@example.com", since, /Action Required/, 4000);
  L.check("No '[Action Required]' error email to the host", !err);
  L.db(`update "Booking" set status='cancelled', "idempotencyKey"=null where uid='${b.uid}'`);
  L.summary(); await T.browser.close(); process.exit(0);
})();
