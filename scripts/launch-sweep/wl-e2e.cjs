const { chromium } = require(process.cwd() + "/node_modules/playwright");
const fs = require("fs");
const { execSync } = require("child_process");
const OUT = process.argv[2];
const APP = "http://localhost:3000";
const TZ = "Asia/Calcutta";
const EXE = process.env.HOME + "/Library/Caches/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell";
const MAIL = process.cwd() + "/.dev-mail";
const db = (sql) => execSync(`psql -At "postgresql://localhost:5432/slotwise_dev" -c ${JSON.stringify(sql)}`).toString().trim();
const results = [];
const RUN = Date.now().toString(36).slice(-4);
const em = (e) => e.replace("@", "+" + RUN + "@");
const check = (label, ok, detail = "") => { results.push({ label, ok }); console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? "  (" + detail + ")" : ""}`); };
const fmtTime = (iso) => new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(iso)).replace(" ", "").toLowerCase();
const fmtDate = (iso) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
const offerLinkFor = (email, since) => {
  const files = fs.readdirSync(MAIL).filter((f) => f.endsWith(".eml")).map((f) => ({ f, t: fs.statSync(MAIL + "/" + f).mtimeMs })).filter((x) => x.t >= since).sort((a, b) => b.t - a.t);
  for (const { f } of files) {
    const raw = fs.readFileSync(MAIL + "/" + f, "utf8").replace(/=\r?\n/g, "").replace(/=3D/g, "=");
    if (!new RegExp("^To:.*" + email.replace(/[.+]/g, (c) => "\\" + c), "mi").test(raw)) continue;
    const m = raw.match(/https?:\/\/[^\s"'<>]*\/waitlist\/claim\/[A-Za-z0-9_-]+/);
    if (m) return { link: m[0], everyone: /told at the same time/.test(raw), move: /Move my booking/.test(raw) };
  }
  return null;
};
const waitForOffer = async (email, since, ms = 20000) => { const end = Date.now() + ms; while (Date.now() < end) { const o = offerLinkFor(email, since); if (o) return o; await new Promise((r) => setTimeout(r, 700)); } return null; };
const entryStatus = (email) => db(`select status from "WaitlistEntry" where email='${email}' order by id desc limit 1`);

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  const person = async () => (await browser.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: TZ, colorScheme: "dark" })).newPage();
  const host = await person();
  await host.goto(APP + "/auth/login", { timeout: 300000 });
  await host.fill('input[name="email"]', "pro@example.com"); await host.fill('input[name="password"]', "pro");
  await host.click('button[type="submit"]'); await host.waitForURL((u) => !u.pathname.startsWith("/auth/login"), { timeout: 300000 });

  const book = async (name, email, dayIndex, timeIndex = 0) => {
    const p = await person();
    await p.goto(APP + "/pro/30min", { timeout: 300000 });
    await p.waitForSelector('[data-testid="day"]', { timeout: 120000 });
    await p.locator('[data-testid="day"]:not([data-disabled="true"])').nth(dayIndex).click();
    await p.waitForSelector('[data-testid="time"]');
    await p.locator('[data-testid="time"]').nth(timeIndex).click();
    await p.waitForSelector('input[name="name"]');
    await p.fill('input[name="name"]', name); await p.fill('input[name="email"]', email);
    await p.locator("textarea").first().fill("Mobility work");
    const budget = p.locator("text=Budget").locator("xpath=following::div[contains(@class,'control')][1]");
    if (await budget.count()) { await budget.click(); await p.keyboard.press("Enter"); }
    await p.getByTestId("confirm-book-button").click();
    await p.waitForSelector('[data-testid="success-page"]', { timeout: 120000 });
    const uid = new URL(p.url()).pathname.split("/").pop();
    const start = db(`select to_char("startTime",'YYYY-MM-DD"T"HH24:MI:SS"Z"') from "Booking" where uid='${uid}'`);
    return { page: p, uid, start };
  };
  const accept = async (uid) => {
    await host.goto(APP + "/booking/" + uid, { timeout: 300000 });
    await host.getByTestId("host-accept").click();
    for (let i = 0; i < 30 && db(`select status from "Booking" where uid='${uid}'`) !== "accepted"; i++) await host.waitForTimeout(500);
  };
  const join = async (name, email, startIso, anyTime = false) => {
    const p = await person();
    await p.goto(`${APP}/waitlist/join/3?date=${fmtDate(startIso)}`, { timeout: 300000 });
    const chip = anyTime ? p.getByTestId("waitlist-any-time") : p.locator('[data-testid="waitlist-join-page"] button[aria-pressed]').filter({ hasText: fmtTime(startIso) }).filter({ hasText: /waiting/i });
    await chip.first().waitFor({ timeout: 60000 }); await chip.first().click();
    const preview = await p.getByTestId("waitlist-position-preview").innerText();
    const inputs = p.locator('[data-testid="waitlist-join-page"] input');
    await inputs.nth(0).fill(name); await inputs.nth(1).fill(email);
    await p.locator('[data-testid="waitlist-join-page"] textarea').first().fill("Anything");
    await p.locator('[data-testid="waitlist-join-page"] select').first().selectOption({ index: 1 });
    await p.getByTestId("waitlist-join-submit").click();
    for (let i = 0; i < 20 && !db(`select 1 from "WaitlistEntry" where email='${email}' and status='WAITING'`); i++) await p.waitForTimeout(500);
    await p.context().close();
    return preview;
  };
  const cancel = async (b) => {
    const p = b.page;
    await p.goto(APP + "/booking/" + b.uid, { timeout: 300000 });
    await p.getByTestId("cancel").click();
    await p.getByTestId("cancel_reason").fill("Can't make it");
    await p.getByTestId("confirm_cancel").click();
    for (let i = 0; i < 30 && db(`select status from "Booking" where uid='${b.uid}'`) !== "cancelled"; i++) await p.waitForTimeout(500);
  };
  const claim = async (link, shot) => {
    const p = await person();
    await p.goto(link, { timeout: 300000 });
    await p.waitForSelector('[data-testid="waitlist-claim-page"]', { timeout: 120000 });
    // The claim endpoint is rate limited per connection; this script claims many offers in a row, so wait it out.
    for (let i = 0; i < 3 && (await p.getByText(/One moment, please|Rate limit/i).count()); i++) {
      await p.waitForTimeout(35000); await p.reload(); await p.waitForSelector('[data-testid="waitlist-claim-page"]', { timeout: 120000 });
    }
    const btn = p.getByTestId("waitlist-claim-button");
    let claimed = false;
    await Promise.race([btn.waitFor({ timeout: 60000 }), p.getByText(/no longer available/i).waitFor({ timeout: 60000 })]).catch(() => {});
    for (let attempt = 0; attempt < 3 && !claimed && (await btn.count()); attempt++) {
      await btn.click();
      await p.waitForURL((u) => u.pathname.startsWith("/booking/"), { timeout: 60000 }).then(() => { claimed = true; }).catch(() => {});
      if (!claimed && !(await p.getByText(/lot of tries/i).count())) break;
      if (!claimed) await p.waitForTimeout(35000);
    }
    await p.waitForTimeout(1200);
    const text = await p.locator("body").innerText();
    if (shot) await p.screenshot({ path: OUT + "/" + shot });
    await p.context().close();
    return { claimed, text };
  };
  const setMode = async (mode) => {
    await host.goto(APP + "/event-types/3?tabName=advanced", { timeout: 300000 });
    await host.getByTestId(`waitlist-offer-mode-${mode}`).waitFor({ timeout: 120000 });
    await host.getByTestId(`waitlist-offer-mode-${mode}`).check();
    await host.getByTestId("booking-rules-card").getByRole("button", { name: /save/i }).click();
    for (let i = 0; i < 20 && db(`select "waitlistOfferMode" from "EventType" where id=3`) !== mode; i++) await host.waitForTimeout(500);
    check(`Host can switch the service to ${mode}`, db(`select "waitlistOfferMode" from "EventType" where id=3`) === mode);
  };

  // A. In order (default)
  console.log("\n--- A. In order: two people waiting, the booker cancels ---");
  await setMode("IN_ORDER");
  const marcoA = await book("Marco A", em("marco.a@example.com"), 5);
  await accept(marcoA.uid);
  await join("Ava A", em("ava.a@example.com"), marcoA.start);
  const prevSam = await join("Sam A", em("sam.a@example.com"), marcoA.start);
  check("Second joiner is told they'd be number 2", /number 2 in line/.test(prevSam), prevSam.replace(/\n/g, " "));
  let since = Date.now();
  await cancel(marcoA);
  const avaOffer = await waitForOffer(em("ava.a@example.com"), since);
  check("First in line (Ava) gets the offer email", !!avaOffer);
  check("Second in line (Sam) does NOT get an email yet", !offerLinkFor(em("sam.a@example.com"), since));
  const avaClaim = await claim(avaOffer.link, "A-claim.png");
  check("Ava claims it and gets a booking", avaClaim.claimed);
  check("Ava has a booking at that time", !!db(`select 1 from "Booking" b join "Attendee" a on a."bookingId"=b.id where a.email='${em("ava.a@example.com")}' and b."startTime"='${marcoA.start.replace("T", " ").replace("Z", "")}' and b.status in ('pending','accepted')`));
  check("Sam is still waiting", entryStatus(em("sam.a@example.com")) === "WAITING");

  // B. First come, first served
  console.log("\n--- B. First come, first served ---");
  await setMode("EVERYONE");
  const leoB = await book("Leo B", em("leo.b@example.com"), 6);
  await accept(leoB.uid);
  await join("Ella B", em("ella.b@example.com"), leoB.start);
  await join("Finn B", em("finn.b@example.com"), leoB.start);
  since = Date.now();
  await cancel(leoB);
  const ellaOffer = await waitForOffer(em("ella.b@example.com"), since);
  const finnOffer = await waitForOffer(em("finn.b@example.com"), since);
  check("Both people waiting get the email at once", !!ellaOffer && !!finnOffer);
  check("The email says everyone was told at the same time", !!finnOffer?.everyone);
  const finnClaim = await claim(finnOffer.link);
  check("Finn (joined second) claims first and gets it", finnClaim.claimed);
  const ellaClaim = await claim(ellaOffer.link, "B-ella-late.png");
  check("Ella's link then says someone else claimed it first", !ellaClaim.claimed && /Someone else claimed this time first/.test(ellaClaim.text));
  check("Ella stays on the waitlist", entryStatus(em("ella.b@example.com")) === "WAITING");
  await setMode("IN_ORDER");

  // C. Any time that day
  console.log("\n--- C. Any time that day ---");
  const noraC = await book("Nora C", em("nora.c@example.com"), 7, 2);
  await accept(noraC.uid);
  await join("Gina C", em("gina.c@example.com"), noraC.start, true);
  check("Gina's entry is an any-time-that-day entry", db(`select kind from "WaitlistEntry" where email='${em("gina.c@example.com")}' order by id desc limit 1`) === "ANY_TIME_ON_DAY");
  since = Date.now();
  await cancel(noraC);
  const ginaOffer = await waitForOffer(em("gina.c@example.com"), since);
  check("Gina is offered the time that opened that day", !!ginaOffer);
  const ginaClaim = await claim(ginaOffer.link, "C-gina.png");
  check("Gina claims it and is booked at that time", ginaClaim.claimed && !!db(`select 1 from "Booking" b join "Attendee" a on a."bookingId"=b.id where a.email='${em("gina.c@example.com")}' and b."startTime"='${noraC.start.replace("T", " ").replace("Z", "")}' and b.status in ('pending','accepted')`));

  // D. Earlier than my booking
  console.log("\n--- D. Earlier than my booking ---");
  const hugo = await book("Hugo D", em("hugo.d@example.com"), 10);
  await accept(hugo.uid);
  const ivy = await book("Ivy D", em("ivy.d@example.com"), 8);
  await accept(ivy.uid);
  await hugo.page.goto(APP + "/booking/" + hugo.uid, { timeout: 300000 });
  await hugo.page.getByTestId("earlier-waitlist-join").click();
  await hugo.page.getByText("You're on the list").waitFor({ timeout: 30000 });
  await hugo.page.getByTestId("earlier-waitlist").screenshot({ path: OUT + "/D-earlier-card.png" });
  check("Hugo joins 'tell me if an earlier time opens' from his booking page", db(`select kind from "WaitlistEntry" where email='${em("hugo.d@example.com")}' order by id desc limit 1`) === "EARLIER_THAN_BOOKING");
  since = Date.now();
  await cancel(ivy);
  const hugoOffer = await waitForOffer(em("hugo.d@example.com"), since);
  check("Hugo is offered Ivy's earlier time, as a move", !!hugoOffer && hugoOffer.move);
  const hugoClaim = await claim(hugoOffer.link, "D-claimed.png");
  const moved = db(`select b.status||'|'||to_char(b."startTime",'YYYY-MM-DD"T"HH24:MI:SS"Z"') from "Booking" b join "Attendee" a on a."bookingId"=b.id where a.email='${em("hugo.d@example.com")}' and b.status in ('pending','accepted') order by b.id desc limit 1`);
  check("Hugo's booking moved to the earlier time", hugoClaim.claimed && moved.endsWith(ivy.start), moved);
  check("Hugo's original later booking is no longer active", db(`select status from "Booking" where uid='${hugo.uid}'`) !== "accepted");

  await browser.close();
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed} of ${results.length} checks passed`);
})().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
