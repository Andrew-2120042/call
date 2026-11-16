const L = require("./lib.cjs"); const { APP, RUN, db, check, section, findMail, link } = L;
(async () => {
  const T = await L.start();
  await section("13. Setup Assistant (AI) makes real changes", async () => {
    const h = await T.login("free@example.com", "free"); await h.dismiss();
    await h.goto(APP + "/assistant", { timeout: 300000 }); await h.getByTestId("assistant-page").waitFor({ timeout: 120000 }); await h.dismiss();
    const title = `Sweep Session ${RUN}`;
    await h.locator("textarea").first().fill(`Create a new 45 minute service called "${title}" with the description "Created by the launch sweep".`);
    await h.keyboard.press("Enter"); await h.locator('button[type="submit"]').first().click().catch(() => {});
    let row = ""; for (let i = 0; i < 40 && !row; i++) { row = db(`select length||'|'||id from "EventType" where title='${title}'`); if (!row) await h.waitForTimeout(2000); }
    check("Assistant creates the service it was asked for", row.startsWith("45|"), row);
    check("…owned by the person who asked", !!row && db(`select u.email from "EventType" e join users u on u.id=e."userId" where e.id=${row.split("|")[1] || 0}`) === "free@example.com");
    if (row) db(`delete from "EventType" where id=${row.split("|")[1]}`);
    await h.context().close();
  });

  await section("14. Service editor saves and the public page updates", async () => {
    const h = await T.login("pro@example.com", "pro"); await h.dismiss();
    await h.goto(APP + "/event-types/1152?tabName=setup", { timeout: 300000 }); await h.getByTestId("event-title").waitFor({ timeout: 120000 }); await h.dismiss();
    const original = await h.getByTestId("event-title").inputValue(); const temp = `Discovery Call ${RUN}`;
    await h.getByTestId("event-title").fill(temp); await h.getByTestId("update-eventtype").click();
    let saved = false; for (let i = 0; i < 20 && !saved; i++) { saved = db(`select title from "EventType" where id=1152`) === temp; if (!saved) await h.waitForTimeout(500); }
    check("Editing a service title saves", saved);
    const v = await T.person(); await v.goto(APP + "/pro/discovery-call", { timeout: 300000 }); await v.waitForSelector('[data-testid="day"]', { timeout: 120000 });
    check("Public booking page shows the new title", (await v.locator("body").innerText()).includes(temp));
    check("Editor shows the live phone preview", (await h.getByTestId("service-phone-preview").count()) > 0);
    await h.reload(); await h.getByTestId("event-title").waitFor({ timeout: 120000 }); await h.dismiss();
    await h.getByTestId("event-title").fill(original); await h.getByTestId("update-eventtype").click();
    for (let i = 0; i < 20 && db(`select title from "EventType" where id=1152`) !== original; i++) await h.waitForTimeout(500);
    check("Title restored", db(`select title from "EventType" where id=1152`) === original, original);
    await h.context().close(); await v.context().close();
  });

  await section("15. Forgot password", async () => {
    const email = db(`select email from users where email like 'sweep+%' and "emailVerified" is not null order by id desc limit 1`);
    const p = await T.person(); const since = Date.now();
    await p.goto(APP + "/auth/forgot-password", { timeout: 300000 }); await p.locator('input[name="email"]').waitFor({ timeout: 60000 });
    await p.fill('input[name="email"]', email); await p.locator('button[type="submit"]').click();
    const m = await findMail(email, since, /password|reset/i);
    check("Reset email arrives", !!m, m?.subject);
    const r = link(m, /https?:\/\/[^\s"'<>]*forgot-password\/[^\s"'<>]+/);
    await p.goto(r, { timeout: 300000 }); const pw = L.crypto.randomBytes(9).toString("base64") + "bB2!";
    await p.locator('input[type="password"]').first().waitFor({ timeout: 60000 }); await p.locator('input[type="password"]').first().fill(pw); await p.locator('button[type="submit"]').click(); await p.waitForTimeout(3500);
    const l = await T.login(email, pw);
    check("New password works", !l.url().includes("/auth/login"), new URL(l.url()).pathname);
    await p.goto(r, { timeout: 300000 }); await p.waitForTimeout(2000);
    check("Reset link can't be used twice", !(await p.locator('input[type="password"]').count()) || /expired|invalid|used|no longer/i.test(await p.locator("body").innerText()));
    const p2 = await T.person(); const s2 = Date.now(); await p2.goto(APP + "/auth/forgot-password", { timeout: 300000 }); await p2.locator('input[name="email"]').waitFor(); await p2.fill('input[name="email"]', `nobody+${RUN}@example.com`); await p2.locator('button[type="submit"]').click(); await p2.waitForTimeout(3000);
    check("Unknown email gets no reset email (and no hint it doesn't exist)", !(await findMail(`nobody+${RUN}@example.com`, s2, null, 3000)) && !/not found|no account|doesn.t exist/i.test(await p2.locator("body").innerText()));
    for (const x of [p, l, p2]) await x.context().close();
  });

  await section("16. Two people grab the same time at once", async () => {
    const first = await T.person(); await first.goto(APP + "/pro/discovery-call", { timeout: 300000 }); await first.waitForSelector('[data-testid="day"]', { timeout: 120000 }); await first.locator('[data-testid="day"]:not([data-disabled="true"])').nth(12).click(); await first.waitForSelector('[data-testid="time"]');
    const slot = await first.locator('[data-testid="time"]').nth(5).getAttribute("data-time"); await first.context().close();
    const open = async (name, email) => { const p = await T.person(); await p.goto(`${APP}/pro/discovery-call?date=${slot.slice(0, 10)}&slot=${encodeURIComponent(slot)}`, { timeout: 300000 }); await p.waitForSelector('input[name="name"]', { timeout: 120000 }); await p.fill('input[name="name"]', name); await p.fill('input[name="email"]', email); await T.fillExtras(p); return p; };
    const a = await open("Racer One", `race1+${RUN}@example.com`), b = await open("Racer Two", `race2+${RUN}@example.com`);
    check("Both have the same time open", !!slot, slot);
    await Promise.all([a.getByTestId("confirm-book-button").click(), b.getByTestId("confirm-book-button").click()]);
    await a.waitForTimeout(9000);
    const n = db(`select count(*) from "Booking" b join "Attendee" t on t."bookingId"=b.id where t.email in ('race1+${RUN}@example.com','race2+${RUN}@example.com') and b.status in ('accepted','pending')`);
    check("Only one of them gets the booking", n === "1", `${n} active bookings`);
    const loser = (await a.getByTestId("success-page").count()) ? b : a;
    check("The other is told the time is taken", !(await loser.getByTestId("success-page").count()) && /no longer|already|not available|taken|unable|try another|booked/i.test(await loser.locator("body").innerText()));
    db(`update "Booking" b set status='cancelled' from "Attendee" t where t."bookingId"=b.id and t.email like 'race_+${RUN}@example.com'`);
    await a.context().close(); await b.context().close();
  });
  L.summary(); await T.browser.close(); process.exit(0);
})().catch((e) => { console.error("FATAL", e.message); process.exit(1); });
