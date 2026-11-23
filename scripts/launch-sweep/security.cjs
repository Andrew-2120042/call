const L = require("./lib.cjs"); const { APP, db, check } = L;
const VICTIM = { pendingUid: "8b7c0cc1-484f-45e5-b30f-820045b707e1", pendingId: 15, acceptedUid: "9a8bf8aa-f675-4fab-9944-952af06fe65e", acceptedId: 5, wlUid: "03f6ca33-c112-43ad-8326-12f4d0d86c18", eventTypeId: 3, teamId: 1 };
(async () => {
  const T = await L.start();
  const a = await T.login("free@example.com", "free");
  const q = async (path, input) => { const r = await a.request.get(`${APP}/api/trpc/${path}?batch=1&input=${encodeURIComponent(JSON.stringify({ 0: { json: input ?? null } }))}`); return { status: r.status(), body: await r.text() }; };
  const m = async (path, input) => { const r = await a.request.post(`${APP}/api/trpc/${path}?batch=1`, { data: { 0: { json: input } } }); return { status: r.status(), body: await r.text() }; };
  const denied = (r) => r.status === 401 || r.status === 403 || r.status === 404 || /"code":"(UNAUTHORIZED|FORBIDDEN|NOT_FOUND|BAD_REQUEST)"/.test(r.body);
  const short = (r) => `${r.status} ${r.body.replace(/\s+/g, " ").slice(0, 90)}`;
  let r;

  console.log("\n--- Reading someone else's data ---");
  r = await q("requestInsights/get", { bookingUid: VICTIM.pendingUid });
  check("Can't read another host's AI summary", denied(r) || /"json":null|"insight":null/.test(r.body), short(r));
  r = await q("bookingRules/get", { eventTypeId: VICTIM.eventTypeId });
  check("Can't read another host's booking rules", denied(r), short(r));
  r = await q("waitlist/list");
  check("Waitlist list shows none of the other host's people", !/nina|ava\.|sam\.|ella|finn|example\.com/i.test(r.body.replace(/free@example\.com/g, "")), short(r));
  r = await q("teams/get", { teamId: VICTIM.teamId });
  check("Can't open a team they're not in", denied(r), short(r));
  r = await q("teams/availability", { teamId: VICTIM.teamId, timeZone: "UTC" });
  check("Can't see that team's availability view", denied(r), short(r));
  r = await q("home/get");
  check("Home data contains nothing from the other account", !r.body.includes("Leah Morgan") && !r.body.includes("Dana Request"), `${r.status}`);
  r = await q("bookings/get", { limit: 50, offset: 0, filters: { status: "unconfirmed" } });
  check("Bookings list shows only their own", !r.body.includes(VICTIM.pendingUid) && !r.body.includes("Leah Morgan"), `${r.status}`);
  r = await q("bookings/get", { limit: 50, offset: 0, filters: { status: "upcoming", search: "%' OR 1=1 --" } });
  check("SQL-style search text returns nothing extra and no error", r.status === 200 && !r.body.includes(VICTIM.acceptedUid), `${r.status}`);
  r = await q("eventTypes/get", { id: VICTIM.eventTypeId });
  check("Can't load another host's service in the editor", denied(r), short(r));
  r = await q("webhook/list", {});
  check("Webhook list shows none of the other account's webhooks", r.status === 200 && !/sweep-secret|"userId":4/.test(r.body), `${r.status}`);

  console.log("\n--- Changing someone else's data ---");
  const before = db(`select title||'|'||"waitlistEnabled"||'|'||"waitlistOfferMode" from "EventType" where id=${VICTIM.eventTypeId}`);
  r = await m("eventTypesHeavy/update", { id: VICTIM.eventTypeId, title: "HACKED", waitlistEnabled: false });
  check("Can't edit another host's service", denied(r) && db(`select title||'|'||"waitlistEnabled"||'|'||"waitlistOfferMode" from "EventType" where id=${VICTIM.eventTypeId}`) === before, short(r));
  r = await m("requestInsights/sendReply", { bookingUid: VICTIM.pendingUid, message: "pay me at evil.example" });
  check("Can't email another host's client through 'Send reply'", denied(r), short(r));
  r = await m("bookings/confirm", { bookingId: VICTIM.pendingId, confirmed: true });
  check("Can't accept another host's request", denied(r) && db(`select status from "Booking" where id=${VICTIM.pendingId}`) === "pending", short(r));
  r = await m("bookings/confirm", { bookingId: VICTIM.pendingId, confirmed: false, reason: "x" });
  check("Can't decline another host's request", denied(r) && db(`select status from "Booking" where id=${VICTIM.pendingId}`) === "pending", short(r));
  r = await m("waitlist/remove", { uid: VICTIM.wlUid });
  check("Can't remove people from another host's waitlist", db(`select status from "WaitlistEntry" where uid='${VICTIM.wlUid}'`) === "WAITING", short(r));
  r = await m("teams/update", { teamId: VICTIM.teamId, name: "HACKED" });
  check("Can't rename a team they're not in", denied(r) && db(`select name from "Team" where id=${VICTIM.teamId}`) !== "HACKED", short(r));
  r = await m("teams/invite", { teamId: VICTIM.teamId, emails: ["evil@example.com"], role: "MEMBER" });
  check("Can't invite people into someone else's team", denied(r) && !db(`select 1 from users where email='evil@example.com'`), short(r));
  r = await m("teams/inviteLink", { teamId: VICTIM.teamId });
  check("Can't get someone else's team invite link", denied(r) && !/join\//.test(r.body), short(r));
  r = await m("teams/create", { name: "Free Team" });
  check("Free plan can't create a team (server-side)", denied(r), short(r));
  r = await m("eventTypesHeavy/update", { id: 15, waitlistEnabled: true });
  check("Free plan can't switch on a paid feature by calling the API directly", denied(r) && db(`select "waitlistEnabled" from "EventType" where id=15`) === "f", short(r));

  console.log("\n--- The other host's booking page, viewed while signed in as someone else ---");
  const page = await a.request.get(`${APP}/booking/${VICTIM.pendingUid}`); const html = await page.text();
  // The page carries every UI label ("AI summary", "Suggested reply"), so check for the stored summary itself.
  const storedSummary = db(`select left(i.summary, 40) from "BookingRequestInsight" i join "Booking" b on b.id = i."bookingId" where b.uid = '${VICTIM.pendingUid}'`);
  check("No AI summary or Accept/Decline for a non-host", !/host-accept|"requestInsight":\{/.test(html) && !(storedSummary && html.includes(storedSummary)), `${page.status()}`);

  console.log("\n--- Signed out ---");
  const anon = await (await T.person()).request;
  for (const [path, label] of [["home/get", "home data"], ["waitlist/list", "waitlist"], ["bookings/get", "bookings"], ["me/get", "account details"], ["apiKeys/list", "API keys"], ["webhook/list", "webhooks"]]) {
    const x = await anon.get(`${APP}/api/trpc/${path}?batch=1&input=${encodeURIComponent(JSON.stringify({ 0: { json: null } }))}`);
    check(`Signed-out: no ${label}`, x.status() === 401 || /UNAUTHORIZED/.test(await x.text()), `${x.status()}`);
  }
  let x = await anon.post(`${APP}/api/billing/polar/webhook`, { data: { type: "subscription.active", data: { id: "fake", customer: { external_id: "4" } } } });
  check("Fake payment webhook (no signature) is rejected", x.status() >= 400, `${x.status()}`);
  x = await anon.post(`${APP}/api/waitlist/claim`, { data: { token: "A".repeat(43) } });
  check("Guessed waitlist claim token is rejected", x.status() >= 400, `${x.status()}`);
  x = await anon.post(`${APP}/api/waitlist/join-earlier`, { data: { bookingUid: "not-a-real-booking" } });
  check("'Earlier time' with an unknown booking is rejected", x.status() >= 400, `${x.status()}`);
  x = await anon.post(`${APP}/api/attendance/confirm`, { data: { token: "x".repeat(43) } });
  check("Guessed attendance token is rejected", x.status() >= 400, `${x.status()}`);
  x = await anon.post(`${APP}/api/rebook/suggest`, { data: { bookingUid: VICTIM.acceptedUid, timeZone: "UTC", candidates: [] } });
  check("Rebook suggestions refuse a booking that isn't cancelled", x.status() >= 400 || !/prefill|@/.test(await x.text()), `${x.status()}`);
  x = await anon.get(`${APP}/api/custom-domains/resolve?host=evil.example`);
  const cd = await x.text();
  check("Custom-domain lookup reveals nothing for an unknown domain", !/email|userId|password/i.test(cd), `${x.status()} ${cd.slice(0, 60)}`);

  console.log("\n--- Secrets in responses ---");
  const t = await T.login("teampro@example.com", "teampro");
  let leak = [];
  for (const path of ["me/get", "apps/integrations", "calendars/connectedCalendars", "credentials/getUserCredentials", "apps/listLocal", "home/get"]) {
    const y = await t.request.get(`${APP}/api/trpc/${path}?batch=1&input=${encodeURIComponent(JSON.stringify({ 0: { json: path === "apps/integrations" ? {} : path === "apps/listLocal" ? { category: "calendar" } : null } }))}`);
    const body = await y.text();
    if (/refresh_token|access_token|"ya29\.|GOCSPX-|"key":\{|client_secret|"password"|"hash":/i.test(body)) leak.push(path + ": " + (body.match(/refresh_token|access_token|ya29\.|GOCSPX-|"key":\{|client_secret|"password"|"hash":/i) || [])[0]);
  }
  check("Account with a connected Google calendar: no tokens, secrets or password hashes in API responses", leak.length === 0, leak.join(" ; "));
  const pub = await anon.get(`${APP}/teampro/calendar-sync-test`); const pubHtml = await pub.text();
  check("Public booking page HTML contains no tokens or server keys", !/"(refresh_token|access_token)\\?"\s*:\s*\\?"(?!Access token)[A-Za-z0-9._-]{20,}|ya29\.|GOCSPX-|sk-ant-|unkey_[A-Za-z0-9]{8}|["'\s]re_[A-Za-z0-9]{8}_|CRON_SECRET|ANTHROPIC_API_KEY|DAILY_API_KEY/.test(pubHtml), `${pub.status()}`);

  console.log("\n--- Redirects and headers ---");
  const lp = await T.person(); await lp.goto(`${APP}/auth/login?callbackUrl=${encodeURIComponent("https://evil.example/steal")}`, { timeout: 300000 });
  await lp.locator('input[name="email"]').waitFor(); await lp.fill('input[name="email"]', "free@example.com"); await lp.fill('input[name="password"]', "free"); await lp.click('button[type="submit"]');
  await lp.waitForURL((u) => !u.pathname.startsWith("/auth/login"), { timeout: 60000 }).catch(() => {}); await lp.waitForTimeout(2500);
  check("Login can't be used to bounce people to another website", new URL(lp.url()).hostname === "localhost", lp.url().slice(0, 60));
  const hd = (await anon.get(`${APP}/auth/login`)).headers();
  console.log("     headers:", ["x-frame-options", "content-security-policy", "x-content-type-options", "referrer-policy", "strict-transport-security"].map((h) => `${h}=${hd[h] ? "set" : "MISSING"}`).join(", "));
  const ck = (await a.context().cookies()).filter((c) => /session-token/.test(c.name))[0];
  check("Session cookie can't be read by page scripts (httpOnly)", !!ck && ck.httpOnly, ck ? `${ck.name} sameSite=${ck.sameSite}` : "no cookie");

  L.summary(); await T.browser.close(); process.exit(0);
})().catch((e) => { console.error("FATAL", e.message.split("\n")[0]); process.exit(1); });
