const L = require("./lib.cjs"); const { APP, RUN, db, check, section, findMail, link } = L;
const http = require("http");
const inTwoDays = () => { const d = new Date(Date.now() + 2 * 86400000); return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Calcutta" }).format(d); };
(async () => {
  const T = await L.start();
  const bookOn = async (path, name, email, date, time = 0) => { const p = await T.person(); await p.goto(`${APP}${path}?date=${date}`, { timeout: 300000 }); await p.waitForSelector('[data-testid="time"]', { timeout: 120000 }); await p.locator('[data-testid="time"]').nth(time).click(); await p.waitForSelector('input[name="name"]'); await p.fill('input[name="name"]', name); await p.fill('input[name="email"]', email); await T.fillExtras(p); await p.getByTestId("confirm-book-button").click(); await p.waitForSelector('[data-testid="success-page"]', { timeout: 45000 }).catch(async (e) => { await p.screenshot({ path: __dirname + "/bookfail-" + name.replace(/\W/g, "") + ".png", fullPage: true }); throw e; }); return { page: p, uid: new URL(p.url()).pathname.split("/").pop() }; };

  await section("6. Confirm-or-release ('are you still coming?')", async () => {
    const e1 = `conf+${RUN}@example.com`, e2 = `noshow+${RUN}@example.com`; const since = Date.now();
    const a = await bookOn("/pro/yoga-class", "Connie Confirm", e1, inTwoDays(), 0);
    const b = await bookOn("/pro/yoga-class", "Nora Noshow", e2, inTwoDays(), 1);
    check("Cron accepts the job", (await L.cron("/api/cron/attendee-confirmations")) === 200);
    const m1 = await findMail(e1, since, /confirm|still coming|attend/i), m2 = await findMail(e2, since, /confirm|still coming|attend/i);
    check("Both clients get an 'are you still coming?' email", !!m1 && !!m2, m1?.subject);
    const c = link(m1, /https?:\/\/[^\s"'<>]*\/attendance\/confirm\/[^\s"'<>]+/);
    const p = await T.person(); await p.goto(c, { timeout: 300000 }); await p.waitForTimeout(2500);
    const st0 = db(`select c.status from "BookingAttendeeConfirmation" c join "Booking" b on b.id=c."bookingId" where b.uid='${a.uid}'`);
    check("Opening the link alone doesn't confirm (safe from email scanners)", st0 === "REQUESTED", st0);
    await p.getByRole("button").filter({ hasText: /confirm|yes|i.ll be there|coming/i }).first().click(); await p.waitForTimeout(2500);
    check("Clicking the button confirms attendance", db(`select c.status from "BookingAttendeeConfirmation" c join "Booking" b on b.id=c."bookingId" where b.uid='${a.uid}'`) === "CONFIRMED");
    await L.cron("/api/cron/attendee-confirmations");
    check("No second email is sent on the next cron run", L.mails(since).filter((x) => x.to.includes(e1) && /confirm|still coming|attend/i.test(x.subject)).length === 1);
    // Let the other person's deadline pass.
    db(`update "BookingAttendeeConfirmation" c set deadline = now() at time zone 'utc' - interval '1 minute' from "Booking" b where b.id=c."bookingId" and b.uid='${b.uid}'`);
    const s2 = Date.now(); await L.cron("/api/cron/attendee-confirmations");
    check("Missed deadline is recorded", db(`select c.status from "BookingAttendeeConfirmation" c join "Booking" b on b.id=c."bookingId" where b.uid='${b.uid}'`) === "MISSED");
    check("The unconfirmed booking is released (service is set to release)", await T.waitStatus(b.uid, "cancelled", 10000), T.status(b.uid));
    check("Confirmed booking is untouched", T.status(a.uid) === "accepted");
    const late = await T.person(); await late.goto(link(m2, /https?:\/\/[^\s"'<>]*\/attendance\/confirm\/[^\s"'<>]+/), { timeout: 300000 }); await late.waitForTimeout(2500);
    check("Late link says it's too late", /too late|passed|no longer|expired|released|cancel/i.test(await late.locator("body").innerText()));
    check("Host is told about the missed confirmation", !!(await findMail("pro@example.com", s2, null, 8000)), (await findMail("pro@example.com", s2, null, 1000))?.subject);
    for (const x of [a.page, b.page, p, late]) await x.context().close();
  });

  await section("7. Reminder emails, exactly once", async () => {
    const e = `remind+${RUN}@example.com`; const r = await bookOn("/pro/discovery-call", "Rita Remind", e, inTwoDays(), 2);
    // Move the clock: booked 3 days ago, starting in 20 hours, so the "1 day before" reminder is due.
    db(`update "Booking" set "createdAt" = now() - interval '3 days', "startTime" = (now() at time zone 'utc') + interval '20 hours', "endTime" = (now() at time zone 'utc') + interval '20 hours 20 minutes' where uid='${r.uid}'`);
    const since = Date.now(); await L.cron("/api/cron/attendee-reminders");
    const m = await findMail(e, since, /remind/i);
    check("Reminder email is sent when due", !!m, m?.subject);
    await L.cron("/api/cron/attendee-reminders"); await L.cron("/api/cron/attendee-reminders"); await new Promise((x) => setTimeout(x, 2500));
    check("Running the job again doesn't send it twice", L.mails(since).filter((x) => x.to.includes(e) && /remind/i.test(x.subject)).length === 1);
    db(`update "Booking" set status='cancelled' where uid='${r.uid}'`); await r.page.context().close();
  });

  await section("8. Team bookings and the team page AI", async () => {
    const since = Date.now();
    const rr = await T.book("/team/seeded-team/round-robin-seeded-team-event", "Robin Client", `robin+${RUN}@example.com`, { day: 11, time: 6 });
    const who = db(`select u.email from "Booking" b join users u on u.id=b."userId" where b.uid='${rr.uid}'`);
    check("Round robin books one team member", T.status(rr.uid) === "accepted" && !!who, who);
    check("That member gets the booking email", !!(await findMail(who, since)));
    const co = await T.book("/team/seeded-team/collective-seeded-team-event", "Colin Client", `colin+${RUN}@example.com`, { day: 11, time: 9 });
    const hosts = db(`select count(*) from "Attendee" a join "Booking" b on b.id=a."bookingId" where b.uid='${co.uid}'`);
    check("Group (collective) booking includes the whole team", T.status(co.uid) === "accepted" && Number(hosts) >= 3, `${hosts} people on the booking`);
    const p = await T.person(); await p.goto(APP + "/team/seeded-team", { timeout: 300000 });
    await p.getByTestId("team-routing-input").fill("I want one quick chat with whoever is free about pricing");
    await p.getByTestId("team-routing-submit").click(); await p.getByTestId("team-routing-result").waitFor({ timeout: 90000 });
    check("AI points the visitor to a service with a reason", (await p.locator('[data-testid="team-routing-result"] a').count()) > 0);
    check("'Find the right fit' hides after answering", !(await p.getByTestId("team-routing-submit").isVisible().catch(() => false)));
    await p.getByTestId("team-routing-input").fill("Who's free next Wednesday at 11am?"); await p.getByTestId("team-routing-submit").click();
    await p.getByTestId("team-routing-availability").waitFor({ timeout: 90000 });
    const av = await p.getByTestId("team-routing-availability").innerText();
    check("'Who's free' answers with a time and people or 'nobody'", /Wednesday/.test(av) && /(Free then|Nobody)/.test(av), av.replace(/\n/g, " "));
    if (await p.getByTestId("team-routing-book-time").count()) { await p.getByTestId("team-routing-book-time").click(); await p.waitForSelector('input[name="name"]', { timeout: 120000 }).catch(() => {}); check("'Book that time' opens the form on that slot", /slot=/.test(p.url()) && await p.locator('input[name="name"]').isVisible()); }
    db(`update "Booking" set status='cancelled' where uid in ('${rr.uid}','${co.uid}')`);
    for (const x of [rr.page, co.page, p]) await x.context().close();
  });

  await section("9. Plans: Free is blocked from paid settings", async () => {
    const f = await T.login("free@example.com", "free"); await f.dismiss();
    await f.goto(APP + "/event-types/15?tabName=advanced", { timeout: 300000 }); await f.getByTestId("booking-rules-card").waitFor({ timeout: 120000 }); await f.dismiss();
    await f.getByTestId("booking-rules-card").locator('input[type="checkbox"]').first().check();
    await f.getByTestId("booking-rules-card").getByRole("button", { name: /save/i }).click(); await f.waitForTimeout(3000);
    check("Free account can't switch on the waitlist (server refuses)", db(`select "waitlistEnabled" from "EventType" where id=15`) === "f");
    check("They're told to upgrade", /upgrade|pro/i.test(await f.locator("body").innerText()));
    await f.goto(APP + "/settings/billing", { timeout: 300000 }); await f.waitForTimeout(3000);
    const t = await f.locator("body").innerText();
    check("Billing page shows Free, Pro $12 and Team $49", /\$12/.test(t) && /\$49/.test(t) && /free/i.test(t));
    await f.goto(APP + "/teams", { timeout: 300000 }); await f.waitForTimeout(2500);
    check("Free account is offered the Team plan instead of creating a team", (await f.getByTestId("teams-upgrade").count()) > 0 || /Team plan/i.test(await f.locator("body").innerText()));
    await f.context().close();
  });

  await section("10. Every host screen opens without errors", async () => {
    const h = await T.login("pro@example.com", "pro"); await h.dismiss();
    const pages = ["/home", "/home/calendar", "/assistant", "/event-types", "/event-types/3?tabName=setup", "/event-types/3?tabName=availability", "/event-types/3?tabName=advanced", "/event-types/3?tabName=recurring", "/bookings/upcoming", "/bookings/unconfirmed", "/bookings/recurring", "/bookings/past", "/bookings/cancelled", "/bookings/upcoming?search=dana", "/availability", "/waitlist", "/teams", "/apps", "/settings/my-account/profile", "/settings/my-account/general", "/settings/my-account/calendars", "/settings/my-account/conferencing", "/settings/my-account/appearance", "/settings/security/password", "/settings/billing", "/settings/domain", "/settings/import", "/settings/developer/webhooks", "/settings/developer/api-keys"];
    const bad = [];
    for (const path of pages) {
      h.errors.length = 0;
      const res = await h.goto(APP + path, { timeout: 300000 }).catch(() => null); await h.waitForTimeout(2200);
      const text = await h.locator("body").innerText().catch(() => "");
      const problem = !res || res.status() >= 400 ? `HTTP ${res?.status()}` : /something went wrong|application error|404|page not found|this page could not be found/i.test(text) ? "error text on page" : h.errors.length ? "JS error: " + h.errors[0] : new URL(h.url()).pathname.startsWith("/auth") ? "bounced to login" : "";
      if (problem) bad.push(`${path} → ${problem}`);
    }
    check(`All ${pages.length} host screens load cleanly`, bad.length === 0, bad.join(" ; "));
    await h.goto(APP + "/bookings/upcoming?search=zzzznotfound", { timeout: 300000 }); await h.waitForTimeout(2500);
    check("Search with no match shows an empty list, not an error", (await h.locator("[data-booking-uid]").count()) === 0);
    await h.context().close();
  });

  await section("11. Public pages, phone size, and errors for bad links", async () => {
    const m = await T.person({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const bad = [];
    for (const path of ["/pro", "/pro/30min", "/pro/discovery-call", "/team/seeded-team", "/team/seeded-team/round-robin-seeded-team-event", "/waitlist/join/3", "/signup", "/auth/login", "/auth/forgot-password"]) {
      m.errors.length = 0; const res = await m.goto(APP + path, { timeout: 300000 }); await m.waitForTimeout(2200);
      const overflow = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (res.status() >= 400) bad.push(`${path} → HTTP ${res.status()}`); else if (m.errors.length) bad.push(`${path} → ${m.errors[0]}`); else if (overflow > 4) bad.push(`${path} → sideways scroll ${overflow}px`);
    }
    check("Public pages load on a phone with no errors or sideways scroll", bad.length === 0, bad.join(" ; "));
    for (const [path, label] of [["/nobody-here-xyz", "unknown person"], ["/pro/no-such-service", "unknown service"], ["/booking/not-a-real-uid", "unknown booking"], ["/team/no-such-team", "unknown team"], ["/waitlist/claim/badtoken", "bad waitlist link"], ["/join/badtoken", "bad invite link"]]) {
      const res = await m.goto(APP + path, { timeout: 300000 }); await m.waitForTimeout(1500); const t = await m.locator("body").innerText();
      check(`${label}: friendly not-found, no crash`, (res.status() === 404 || /not found|isn.t valid|doesn.t work|no longer|404|couldn.t|does not exist|unavailable/i.test(t)) && !/application error|unhandled/i.test(t), `HTTP ${res.status()}`);
    }
    await m.context().close();
  });

  await section("12. Webhooks", async () => {
    const got = []; const secret = "sweep-secret-" + RUN;
    const server = http.createServer((req, res) => { let body = ""; req.on("data", (c) => (body += c)); req.on("end", () => { got.push({ headers: req.headers, body }); res.end("ok"); }); }).listen(0);
    const port = server.address().port; const id = "sweep-" + RUN;
    db(`insert into "Webhook" (id,"userId","subscriberUrl",active,"eventTriggers",secret) values ('${id}',4,'http://127.0.0.1:${port}/hook',true,'{BOOKING_CREATED,BOOKING_CANCELLED}','${secret}')`);
    const w = await T.book("/pro/discovery-call", "Wendy Hook", `wendy+${RUN}@example.com`, { day: 6, time: 3 });
    for (let i = 0; i < 20 && !got.length; i++) await new Promise((x) => setTimeout(x, 500));
    const hit = got[0];
    check("Booking sends a webhook", !!hit && /BOOKING_CREATED/.test(hit.body));
    const sig = hit && L.crypto.createHmac("sha256", secret).update(hit.body).digest("hex");
    check("It carries a valid Nodslot signature header", !!hit && hit.headers["x-nodslot-signature-256"] === sig, hit ? Object.keys(hit.headers).filter((k) => k.startsWith("x-")).join(",") : "");
    db(`delete from "Webhook" where id='${id}'`); db(`update "Booking" set status='cancelled' where uid='${w.uid}'`); server.close(); await w.page.context().close();
  });

  L.summary(); await T.browser.close(); process.exit(0);
})().catch((e) => { console.error("FATAL", e.message); process.exit(1); });
