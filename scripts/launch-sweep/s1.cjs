const L = require("./lib.cjs"); const { APP, RUN, db, check, section, findMail, link } = L;
(async () => {
  const T = await L.start();
  const email = `sweep+${RUN}@example.com`, user = `sweep${RUN}`, pw = L.crypto.randomBytes(9).toString("base64") + "aA1!";
  let host;
  await section("1. Sign up, verify email, first-time setup", async () => {
    const p = await T.person(); const since = Date.now();
    await p.goto(APP + "/signup", { timeout: 300000 });
    if (await p.getByTestId("continue-with-email-button").count()) await p.getByTestId("continue-with-email-button").click();
    await p.locator('input[name="email"]').waitFor({ timeout: 60000 });
    await p.locator('input[name="username"]').fill(user); await p.locator('input[name="email"]').fill(email); await p.getByTestId("signup-passwordfield").fill(pw);
    await p.getByTestId("signup-submit-button").click();
    await p.waitForURL((u) => !u.pathname.startsWith("/signup"), { timeout: 120000 }).catch(() => {});
    check("New account is created", !!db(`select 1 from users where email='${email}'`));
    check("Lands on 'verify your email'", p.url().includes("verify-email"), new URL(p.url()).pathname);
    const m = await findMail(email, since, /verify/i);
    check("Verification email arrives", !!m, m?.subject);
    const v = link(m, /https?:\/\/[^\s"'<>]*verify[^\s"'<>]*/i);
    await p.goto(v, { timeout: 300000 }); await p.waitForTimeout(3000);
    check("Email gets verified", !!db(`select "emailVerified" from users where email='${email}'`));
    for (let i = 0; i < 12 && p.url().includes("/onboarding"); i++) { await p.waitForTimeout(1500); if (p.url().includes("/personal/questions")) { await p.getByText(/Skip, I.ll set it up myself/).click(); await p.waitForTimeout(1500); continue; } const n = p.locator('input[name="name"]').first(); if (await n.count()) await n.fill("Sweep Host"); const next = p.getByTestId("onboarding-continue-btn"); const skip = p.getByRole("button", { name: /skip|finish|continue|done/i }).last(); if (await next.isVisible().catch(() => false) && await next.isEnabled()) await next.click(); else if (await skip.isVisible().catch(() => false)) await skip.click(); await p.waitForTimeout(1500); }
    await p.waitForTimeout(3000);
    check("Setup finishes outside onboarding", !p.url().includes("/onboarding"), new URL(p.url()).pathname);
    const n = db(`select count(*) from "EventType" e join users u on u.id=e."userId" where u.email='${email}'`);
    check("New account starts with 3 default services", n === "3", n);
    check("Time zone is taken from the browser", db(`select "timeZone" from users where email='${email}'`).startsWith("Asia/"), db(`select "timeZone" from users where email='${email}'`));
    check("New account is on the Free plan", !db(`select 1 from "PlanSubscription" p join users u on u.id=p."userId" where u.email='${email}'`));
    await p.context().close();
  });
  await section("2. Log in / log out / wrong password", async () => {
    const bad = await T.login(email, "wrong-password-123");
    check("Wrong password is refused", bad.url().includes("/auth/login"));
    await bad.context().close();
    host = await T.login(email, pw);
    check("Correct password logs in", !host.url().includes("/auth/login"), new URL(host.url()).pathname);
    const anon = await T.person(); await anon.goto(APP + "/bookings/upcoming", { timeout: 300000 }); await anon.waitForTimeout(1500);
    check("Signed-out visitors are sent to login from app pages", anon.url().includes("/auth/login"));
    await anon.context().close();
  });
  let b1;
  await section("3. Instant booking on a free account's service", async () => {
    const since = Date.now();
    b1 = await T.book(`/${user}/intro-call`, "Cara Client", `cara+${RUN}@example.com`, { day: 3, time: 1, notes: "Looking forward to it" });
    check("Booking is confirmed straight away", T.status(b1.uid) === "accepted", T.status(b1.uid));
    check("Client gets a confirmation email", !!(await findMail(`cara+${RUN}@example.com`, since)), (await findMail(`cara+${RUN}@example.com`, since))?.subject);
    check("Host gets a new-booking email", !!(await findMail(email, since)), (await findMail(email, since))?.subject);
    await host.goto(APP + "/bookings/upcoming", { timeout: 300000 }); await host.waitForSelector("[data-booking-uid]", { timeout: 60000 }).catch(() => {});
    check("Booking shows in the host's Upcoming list", (await host.locator(`[data-booking-uid="${b1.uid}"]`).count()) > 0);
    const start = db(`select to_char("startTime",'YYYY-MM-DD"T"HH24:MI:SS".000Z"') from "Booking" where uid='${b1.uid}'`);
    const again = await T.person(); await again.goto(`${APP}/${user}/intro-call?date=${start.slice(0, 10)}`, { timeout: 300000 }); await again.waitForSelector('[data-testid="time"]', { timeout: 60000 });
    const times = await again.locator('[data-testid="time"]').evaluateAll((els) => els.map((e) => e.getAttribute("data-time")));
    check("That time is no longer offered to others", !times.includes(start), `${times.length} times left`);
    await again.context().close();
    check("Free plan shows the Calbee badge on the booking page", /Calbee/i.test(await b1.page.locator("body").innerText()));
  });
  await section("4. Client reschedules, then cancels", async () => {
    const p = b1.page; let since = Date.now();
    await p.goto(`${APP}/reschedule/${b1.uid}`, { timeout: 300000 });
    await p.waitForSelector('[data-testid="day"]', { timeout: 120000 }).catch(async (e) => { await p.screenshot({ path: __dirname + "/reschedule-fail-days.png", fullPage: true }); throw e; });
    await p.locator('[data-testid="day"]:not([data-disabled="true"])').nth(5).click();
    await p.waitForSelector('[data-testid="time"]'); await p.locator('[data-testid="time"]').nth(2).click();
    await p.getByTestId("confirm-reschedule-button").click();
    await p.waitForSelector('[data-testid="success-page"]', { timeout: 120000 }).catch(async (e) => { await p.screenshot({ path: __dirname + "/reschedule-fail-confirm.png", fullPage: true }); throw e; });
    const newUid = new URL(p.url()).pathname.split("/").pop();
    check("Reschedule creates the new booking", newUid !== b1.uid && T.status(newUid) === "accepted", T.status(newUid));
    check("Old booking is closed and marked rescheduled", db(`select status||'|'||coalesce(rescheduled::text,'') from "Booking" where uid='${b1.uid}'`) === "cancelled|true", db(`select status||'|'||coalesce(rescheduled::text,'') from "Booking" where uid='${b1.uid}'`));
    check("Client gets a rescheduled email", /rescheduled/i.test((await findMail(`cara+${RUN}@example.com`, since))?.raw || ""), (await findMail(`cara+${RUN}@example.com`, since))?.subject);
    since = Date.now();
    await p.getByTestId("cancel").click(); await p.getByTestId("cancel_reason").fill("Plans changed"); await p.getByTestId("confirm_cancel").click();
    check("Client can cancel", await T.waitStatus(newUid, "cancelled"));
    check("Client gets a cancellation email with 'Pick a new time'", /Pick a new time/i.test((await findMail(`cara+${RUN}@example.com`, since, /cancel/i))?.raw || ""));
    check("Host gets a cancellation email", !!(await findMail(email, since, /cancel/i)));
    await p.waitForSelector('[data-testid="rebook-accept"]', { timeout: 90000 }).catch(() => {});
    const n = await p.getByTestId("rebook-accept").count();
    check("Cancelled page offers 3 new times (AI rebook)", n === 3, `${n} suggestions`);
    // One-click rebook (since 2026-11-20): pick a time, confirm, and the client is booked without a form.
    if (n) {
      await p.getByTestId("rebook-accept").first().click();
      await p.getByTestId("rebook-confirm").click();
      await p.waitForURL((u) => u.pathname.startsWith("/booking/") && !u.pathname.endsWith(newUid), { timeout: 120000 });
      const rebookedUid = new URL(p.url()).pathname.split("/").pop();
      check("'Book this time' then Confirm books the client in one click", T.status(rebookedUid) === "accepted", T.status(rebookedUid));
    }
    await p.context().close();
  });
  let host2;
  await section("5. Approval requests with AI summary (Pro)", async () => {
    host2 = await T.login("pro@example.com", "pro");
    const since = Date.now();
    const r = await T.book("/pro/30min", "Dana Request", `dana+${RUN}@example.com`, { day: 8, time: 3, notes: "I'm a physio patient with lower back pain, want a gentle 4 week plan. Mornings are best." });
    check("Booking on an approval service is pending", T.status(r.uid) === "pending", T.status(r.uid));
    check("Client sees 'request sent', not 'booked'", /request|confirm or reject|pending|awaiting/i.test(await r.page.locator('[data-testid="success-page"]').innerText()));
    check("Client gets a 'request sent' email", !!(await findMail(`dana+${RUN}@example.com`, since)), (await findMail(`dana+${RUN}@example.com`, since))?.subject);
    // AI summary: run the request-insights cron and the task runner the way production would.
    let insight = "";
    for (let i = 0; i < 12 && !insight; i++) { await L.cron("/api/cron/request-insights"); await L.cron("/api/tasks/cron"); insight = db(`select i.fit from "BookingRequestInsight" i join "Booking" b on b.id=i."bookingId" where b.uid='${r.uid}'`); if (!insight) await new Promise((x) => setTimeout(x, 5000)); }
    check("AI summary is written for the request", !!insight, insight);
    let hostMailSent = false; for (let i = 0; i < 20 && !hostMailSent; i++) { await L.cron("/api/tasks/cron"); hostMailSent = !!db(`select 1 from "Task" where type='sendHostRequestEmail' and payload like '%${r.uid}%' and "succeededAt" is not null`); if (!hostMailSent) await new Promise((x) => setTimeout(x, 6000)); }
    check("Deferred host email task runs", hostMailSent);
    const hm = await findMail("pro@example.com", since, /approval|request|waiting/i, 20000);
    check("Host's request email arrives with the AI summary in it", /AI summary/i.test(hm?.raw || ""), hm?.subject);
    await host2.goto(APP + "/bookings/unconfirmed?search=Dana", { timeout: 300000 }); await host2.dismiss(); await host2.waitForSelector(`[data-booking-uid="${r.uid}"]`, { timeout: 60000 }).catch(() => {});
    check("Request shows in Unconfirmed with an AI label", (await host2.locator(`[data-booking-uid="${r.uid}"] [data-testid="request-insight-line"]`).count()) > 0);
    await host2.goto(APP + "/booking/" + r.uid, { timeout: 300000 }); await host2.getByTestId("request-insight").waitFor({ timeout: 60000 });
    check("Request page shows summary, suggested reply and Accept/Decline", (await host2.getByTestId("host-accept").count()) > 0 && (await host2.getByTestId("host-decline").count()) > 0 && /Suggested reply/i.test(await host2.getByTestId("request-insight").innerText()));
    let s2 = Date.now();
    await host2.dismiss(); await host2.getByTestId("send-request-reply").click({ timeout: 15000 }).catch(async (e) => { await host2.screenshot({ path: __dirname + "/reply-fail.png" }); throw e; });
    const reply = await findMail(`dana+${RUN}@example.com`, s2, null, 15000);
    check("'Send reply' emails the client, reply-to the host", !!reply && /Reply-To:.*pro@example.com/i.test(reply.raw), reply?.subject);
    s2 = Date.now();
    await host2.getByTestId("host-accept").click();
    check("Accept confirms the booking", await T.waitStatus(r.uid, "accepted"));
    check("Client gets the confirmation email after acceptance", !!(await findMail(`dana+${RUN}@example.com`, s2, /between/i)), (await findMail(`dana+${RUN}@example.com`, s2))?.subject);
    const r2 = await T.book("/pro/30min", "Spam Sam", `sam+${RUN}@example.com`, { day: 9, time: 4, notes: "BUY CHEAP SEO BACKLINKS!!! visit rank-boost dot example" });
    s2 = Date.now();
    await host2.goto(APP + "/booking/" + r2.uid, { timeout: 300000 }); await host2.dismiss(); await host2.getByTestId("host-decline").click();
    await host2.locator('textarea[name="rejectionReason"]').fill("Not a fit, sorry");
    await host2.locator("button", { hasText: "Decline request" }).click();
    check("Decline rejects the booking", await T.waitStatus(r2.uid, "rejected"), T.status(r2.uid));
    check("Client gets a declined email", !!(await findMail(`sam+${RUN}@example.com`, s2, /declin|reject/i)), (await findMail(`sam+${RUN}@example.com`, s2))?.subject);
    await r.page.context().close(); await r2.page.context().close();
  });
  L.summary(); await T.browser.close();
})().catch((e) => { console.error("FATAL", e.message); process.exit(1); });
