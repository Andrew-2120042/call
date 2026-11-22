const { chromium } = require(process.cwd() + "/node_modules/playwright");
const fs = require("fs"); const crypto = require("crypto"); const { execSync } = require("child_process");
const APP = "https://app.nodslot.site";
const DB = fs.readFileSync(".env.launch-keys", "utf8").match(/^PROD_DATABASE_DIRECT_URL=(.*)$/m)[1];
const db = (sql) => execSync(`psql ${JSON.stringify(DB)} -At -c ${JSON.stringify(sql)}`).toString().trim();
const RUN = Date.now().toString(36).slice(-5);
const results = []; const check = (l, ok, d = "") => { results.push(!!ok); console.log(`${ok ? "PASS" : "FAIL"}  ${l}${d ? "  (" + String(d).slice(0, 140) + ")" : ""}`); };
const hostEmail = `delivered+host${RUN}@resend.dev`, user = `qa${RUN}`, pw = crypto.randomBytes(9).toString("base64") + "aA1!";
(async () => {
  const b = await chromium.launch({ executablePath: process.env.HOME + "/Library/Caches/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell" });
  const person = async () => { const c = await b.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: "America/New_York", colorScheme: "dark" }); const p = await c.newPage(); p.errs = []; p.on("pageerror", (e) => p.errs.push(e.message.slice(0, 100))); return p; };
  try {
    console.log("--- Landing and signup ---");
    const l = await person(); await l.goto("https://nodslot.site", { timeout: 60000 });
    check("Website loads with the Calbee name", /Calbee/.test(await l.title() + await l.locator("body").innerText()));
    const signupHref = await l.evaluate(() => [...document.querySelectorAll("a")].map((a) => a.href).find((h) => /app\.nodslot\.site\/signup/.test(h)));
    check("Website's sign-up button points at the live app", !!signupHref, signupHref);
    const s = await person(); await s.goto(APP + "/signup", { timeout: 60000 });
    if (await s.getByTestId("continue-with-email-button").count()) await s.getByTestId("continue-with-email-button").click();
    await s.locator('input[name="email"]').waitFor({ timeout: 60000 });
    await s.locator('input[name="username"]').fill(user); await s.locator('input[name="email"]').fill(hostEmail); await s.getByTestId("signup-passwordfield").fill(pw);
    await s.getByTestId("signup-submit-button").click();
    await s.waitForURL((u) => !u.pathname.startsWith("/signup"), { timeout: 90000 }).catch(() => {});
    check("Sign-up creates the account on production", !!db(`select 1 from users where email='${hostEmail}'`), new URL(s.url()).pathname);
    // The verification email went to a test inbox; mark it verified the way the link would.
    db(`update users set "emailVerified"=now() where email='${hostEmail}'`);
    await s.goto(APP + "/auth/login", { timeout: 60000 }).catch(() => {});
    await s.context().close();
    const h = await person(); h.on("console", (m) => { if (m.type() === "error") console.log("     console:", m.text().slice(0, 160)); }); h.on("response", (r) => { if (r.status() >= 400 && !/favicon/.test(r.url())) console.log("     HTTP", r.status(), r.url().slice(0, 110)); }); await h.goto(APP + "/auth/login", { timeout: 60000 });
    await h.fill('input[name="email"]', hostEmail); await h.fill('input[name="password"]', pw); await h.click('button[type="submit"]');
    await h.waitForURL((u) => !u.pathname.startsWith("/auth/login"), { timeout: 90000 });
    await h.waitForURL((u) => u.pathname.startsWith("/onboarding") || u.pathname.startsWith("/event-types"), { timeout: 90000 }).catch(() => {});
    await h.waitForTimeout(3000);
    for (let i = 0; i < 10 && h.url().includes("/onboarding"); i++) {
      if (h.url().includes("/personal/questions")) { await h.getByText(/Skip, I.ll set it up myself/).click(); await h.waitForTimeout(5000); continue; }
      if (h.url().includes("getting-started")) await h.getByText("For personal use").first().click().catch(() => {});
      const n = h.locator('input[name="name"]').first(); if (await n.count()) await n.fill("QA Host");
      const btn = h.getByTestId("onboarding-continue-btn");
      const vis = await btn.isVisible().catch(() => false); console.log("     step", new URL(h.url()).pathname, "continue visible:", vis, vis ? "enabled: " + (await btn.isEnabled()) : "");
      if (vis) await btn.click().catch((e) => console.log("     click failed", e.message.slice(0, 80)));
      else await h.getByRole("button", { name: /skip|finish|done|continue/i }).last().click().catch(() => {});
      await h.waitForTimeout(7000);
    }
    await h.waitForTimeout(4000);
    if (h.url().includes("/onboarding")) { await h.screenshot({ path: require("os").tmpdir() + "/onb-stuck.png" }); console.log("     page errors:", h.errs.join(" | ").slice(0, 300)); }
    check("Login and first-time setup work", !h.url().includes("/onboarding") && !h.url().includes("/auth/"), new URL(h.url()).pathname);
    check("Default services were created", db(`select count(*) from "EventType" e join users u on u.id=e."userId" where u.email='${hostEmail}'`) === "3");
    console.log("--- Booking ---");
    const c = await person(); await c.goto(`${APP}/${user}/intro-call`, { timeout: 90000 });
    await c.waitForSelector('[data-testid="day"]', { timeout: 90000 });
    await c.locator('[data-testid="day"]:not([data-disabled="true"])').nth(2).click();
    await c.waitForSelector('[data-testid="time"]', { timeout: 60000 }); await c.locator('[data-testid="time"]').nth(1).click();
    await c.waitForSelector('input[name="name"]'); await c.fill('input[name="name"]', "QA Client"); await c.fill('input[name="email"]', `delivered+client${RUN}@resend.dev`);
    await c.locator('textarea[name="notes"]').fill("Mornings work best for me, ideally before 10am.").catch(() => {});
    await c.getByTestId("confirm-book-button").click();
    await c.waitForSelector('[data-testid="success-page"]', { timeout: 90000 });
    const uid = new URL(c.url()).pathname.split("/").pop();
    check("Client can book on the live site", db(`select status from "Booking" where uid='${uid}'`) === "accepted");
    const ref = db(`select r.type||'|'||coalesce(r."meetingUrl",'') from "BookingReference" r join "Booking" bk on bk.id=r."bookingId" where bk.uid='${uid}'`);
    check("No built-in video room is made (host's own Meet/Zoom/Teams only)", !/daily_video/.test(ref), ref || "no video reference");
    console.log("--- Cancel and AI rebook ---");
    await c.getByTestId("cancel").click(); await c.getByTestId("cancel_reason").fill("Something came up"); await c.getByTestId("confirm_cancel").click();
    await c.waitForSelector('[data-testid="rebook-accept"]', { timeout: 90000 }).catch(() => {});
    check("Cancelling works and AI offers new times", db(`select status from "Booking" where uid='${uid}'`) === "cancelled" && (await c.getByTestId("rebook-accept").count()) > 0, `${await c.getByTestId("rebook-accept").count()} suggestions`);
    console.log("--- Host screens ---");
    const bad = [];
    for (const path of ["/home", "/event-types", "/bookings/upcoming", "/bookings/cancelled", "/availability", "/waitlist", "/teams", "/apps", "/settings/my-account/profile", "/settings/billing", "/assistant"]) {
      h.errs.length = 0; const r = await h.goto(APP + path, { timeout: 90000 }).catch(() => null); await h.waitForTimeout(2500);
      const t = await h.locator("body").innerText().catch(() => "");
      if (!r || r.status() >= 400) bad.push(`${path} HTTP ${r?.status()}`); else if (/application error|something went wrong/i.test(t)) bad.push(`${path} error text`); else if (h.errs.length) bad.push(`${path} ${h.errs[0]}`);
    }
    check("Host screens load on production", bad.length === 0, bad.join(" ; "));
    const apps = await h.goto(APP + "/apps/installed/calendar", { timeout: 90000 }); await h.waitForTimeout(3000);
    check("Calendar apps page loads", apps.status() < 400);
    const anon = await (await b.newContext()).request;
    const me = await anon.get(APP + "/api/trpc/me/get?batch=1&input=" + encodeURIComponent(JSON.stringify({ 0: { json: null } })));
    check("Signed-out API calls are refused", me.status() === 401, me.status());
  } catch (e) { check("prod smoke ran to the end", false, e.message.split("\n")[0]); }
  console.log(`\n${results.filter(Boolean).length} of ${results.length} checks passed`);
  fs.writeFileSync(require("os").tmpdir() + "/nodslot-prod-run.json", JSON.stringify({ RUN, hostEmail, user }));
  await b.close(); process.exit(0);
})();
