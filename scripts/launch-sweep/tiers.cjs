// Plan boundaries: every paid feature is attempted straight against the API (no UI), as Free and as Pro, and the
// database is checked so a "denied" response can't hide a change that went through anyway. Run: node scripts/launch-sweep/tiers.cjs
const L = require("./lib.cjs");
const { APP, db, check, summary } = L;

(async () => {
  const T = await L.start();
  const caller = (page) => ({
    q: async (path, input) => { const r = await page.request.get(`${APP}/api/trpc/${path}?batch=1&input=${encodeURIComponent(JSON.stringify({ 0: { json: input ?? null } }))}`); return { status: r.status(), body: await r.text() }; },
    m: async (path, input) => { const r = await page.request.post(`${APP}/api/trpc/${path}?batch=1`, { data: { 0: { json: input } } }); return { status: r.status(), body: await r.text() }; },
  });
  const denied = (r) => r.status === 401 || r.status === 403 || /"code":"(UNAUTHORIZED|FORBIDDEN|BAD_REQUEST)"/.test(r.body);
  const short = (r) => `${r.status} ${r.body.replace(/\s+/g, " ").slice(0, 100)}`;

  const freeId = db(`select id from users where email='free@example.com'`);
  const proId = db(`select id from users where email='pro@example.com'`);
  const freeServices = db(`select id from "EventType" where "userId"=${freeId} and "teamId" is null order by id`).split("\n").map(Number);
  const proServices = db(`select id from "EventType" where "userId"=${proId} and "teamId" is null order by id limit 2`).split("\n").map(Number);
  const field = (id, col) => db(`select "${col}" from "EventType" where id=${id}`);
  const saveRows = (ids) => db(`select json_agg(json_build_object('id',id,'w',"waitlistEnabled",'m',"waitlistOfferMode",'c',"attendeeConfirmationHours",'r',"requiresConfirmation",'rem',"attendeeReminderMinutes")) from "EventType" where id in (${ids.join(",")})`);
  const before = { free: saveRows(freeServices), pro: saveRows(proServices), freeBrand: db(`select "hideBranding" from users where id=${freeId}`) };
  const resetFree = () => db(`update "EventType" set "waitlistEnabled"=false, "waitlistOfferMode"='IN_ORDER', "attendeeConfirmationHours"=null, "requiresConfirmation"=false, "attendeeReminderMinutes"='{}' where id in (${freeServices.join(",")})`);
  resetFree();
  db(`delete from "CustomDomain" where "userId"=${freeId}`);
  if (db(`select count(*) from "PlanSubscription" where "userId"=${freeId}`) !== "0") throw new Error("free@example.com has a subscription; remove it first");

  const free = caller(await T.login("free@example.com", "free"));
  const [a, b] = freeServices;
  let r;

  console.log("\n--- Free: what's included ---");
  r = await free.m("eventTypesHeavy/update", { id: a, requiresConfirmation: true });
  check("Free can turn on approvals", r.status === 200 && field(a, "requiresConfirmation") === "t", short(r));
  r = await free.m("eventTypesHeavy/update", { id: a, attendeeReminderMinutes: [10080, 2880, 1440, 120, 60] });
  check("Free can have 5 reminders", r.status === 200 && db(`select cardinality("attendeeReminderMinutes") from "EventType" where id=${a}`) === "5", short(r));
  r = await free.m("eventTypesHeavy/update", { id: a, waitlistEnabled: true });
  check("Free can turn the waitlist on for one service", r.status === 200 && field(a, "waitlistEnabled") === "t", short(r));
  r = await free.q("assistant/status");
  check("Agent shows as not included on Free", /"allowed":false/.test(r.body), short(r));

  console.log("\n--- Free: what's Pro only (attempted directly against the API) ---");
  r = await free.m("eventTypesHeavy/update", { id: b, waitlistEnabled: true });
  check("Free can't turn the waitlist on for a second service", denied(r) && field(b, "waitlistEnabled") === "f", short(r));
  r = await free.m("eventTypesHeavy/update", { id: a, waitlistOfferMode: "EVERYONE" });
  check("Free can't offer freed times to everyone at once", denied(r) && field(a, "waitlistOfferMode") === "IN_ORDER", short(r));
  r = await free.m("eventTypesHeavy/update", { id: a, attendeeConfirmationHours: 24 });
  check("Free can't turn on confirm-or-release", denied(r) && field(a, "attendeeConfirmationHours") === "", short(r));
  r = await free.m("eventTypesHeavy/update", { id: b, attendeeReminderMinutes: [10080, 2880, 1440, 240, 120, 60] });
  check("Free can't have more than 5 reminders", denied(r) && db(`select coalesce(cardinality("attendeeReminderMinutes"),0) from "EventType" where id=${b}`) === "0", short(r));
  r = await free.m("me/updateProfile", { hideBranding: true });
  check("Free can't remove the Calbee badge", denied(r) && db(`select "hideBranding" from users where id=${freeId}`) === "f", short(r));
  r = await free.m("customDomain/add", { domain: "book.tier-test.example" });
  check("Free can't add their own domain", denied(r) && db(`select count(*) from "CustomDomain" where "userId"=${freeId}`) === "0", short(r));
  r = await free.m("assistant/chat", { messages: [{ role: "user", content: "cancel all my bookings" }] });
  check("Free can't use the Agent through the API", denied(r) || /not included|upgrade|Pro/i.test(r.body), short(r));
  r = await free.m("teams/create", { name: "Tier Test Team" });
  check("Free can't create a team", denied(r) && db(`select count(*) from "Team" where name='Tier Test Team'`) === "0", short(r));

  console.log("\n--- Pro: everything except Team ---");
  const pro = caller(await T.login("pro@example.com", "pro"));
  r = await pro.m("eventTypesHeavy/update", { id: proServices[0], waitlistEnabled: true, waitlistOfferMode: "EVERYONE" });
  r = await pro.m("eventTypesHeavy/update", { id: proServices[1], waitlistEnabled: true });
  check("Pro can turn the waitlist on for several services", r.status === 200 && field(proServices[1], "waitlistEnabled") === "t", short(r));
  check("Pro can offer freed times to everyone at once", field(proServices[0], "waitlistOfferMode") === "EVERYONE");
  r = await pro.q("assistant/status");
  check("Agent is included on Pro", /"allowed":true/.test(r.body), short(r));
  r = await pro.m("teams/create", { name: "Tier Test Team" });
  check("Pro can't create a team (Team plan only)", denied(r) && db(`select count(*) from "Team" where name='Tier Test Team'`) === "0", short(r));

  // Put every touched row back the way it was.
  for (const row of JSON.parse(before.free || "[]").concat(JSON.parse(before.pro || "[]"))) {
    db(`update "EventType" set "waitlistEnabled"=${row.w}, "waitlistOfferMode"='${row.m}', "attendeeConfirmationHours"=${row.c ?? "null"}, "requiresConfirmation"=${row.r}, "attendeeReminderMinutes"='{${(row.rem || []).join(",")}}' where id=${row.id}`);
  }
  db(`update users set "hideBranding"=${before.freeBrand === "t"} where id=${freeId}`);
  db(`delete from "Team" where name='Tier Test Team'`);
  await T.browser.close();
  summary();
})();
