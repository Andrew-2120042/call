const L = require("./lib.cjs"); const { APP, db, check } = L;
(async () => {
  const T = await L.start(); const a = await T.login("free@example.com", "free");
  const q = async (p, i) => { const r = await a.request.get(`${APP}/api/trpc/${p}?batch=1&input=${encodeURIComponent(JSON.stringify({ 0: { json: i } }))}`); return { s: r.status(), b: await r.text() }; };
  const m = async (p, i) => { const r = await a.request.post(`${APP}/api/trpc/${p}?batch=1`, { data: { 0: { json: i } } }); return { s: r.status(), b: await r.text() }; };
  const denied = (r) => r.s >= 400;
  const mem = db(`select id from "Membership" where "teamId"=1 and role='MEMBER' limit 1`);
  let r = await q("teams/insights", { teamId: 1 }); check("Can't read another team's stats", denied(r), `${r.s}`);
  r = await m("teams/removeMember", { membershipId: Number(mem) }); check("Can't remove a member from another team", denied(r) && !!db(`select 1 from "Membership" where id=${mem}`), `${r.s}`);
  r = await m("teams/changeRole", { membershipId: Number(mem), role: "ADMIN" }); check("Can't promote members in another team", denied(r) && db(`select role from "Membership" where id=${mem}`) === "MEMBER", `${r.s}`);
  r = await m("teams/delete", { teamId: 1 }); check("Can't delete another team", denied(r) && !!db(`select 1 from "Team" where id=1`), `${r.s}`);
  r = await m("teams/acceptInvite", { teamId: 1 }); check("Can't 'accept' an invite that was never sent", denied(r) && !db(`select 1 from "Membership" m join users u on u.id=m."userId" where m."teamId"=1 and u.email='free@example.com'`), `${r.s}`);
  r = await m("eventTypesHeavy/create", { title: "Sneaky", slug: "sneaky-" + L.RUN, length: 15, teamId: 1, schedulingType: "ROUND_ROBIN" }); check("Can't create a service inside another team", denied(r) && !db(`select 1 from "EventType" where slug='sneaky-${L.RUN}'`), `${r.s} ${r.b.slice(0, 80)}`);
  r = await m("eventTypesHeavy/delete", { id: 3 }); check("Can't delete another host's service", denied(r) && !!db(`select 1 from "EventType" where id=3`), `${r.s}`);
  L.summary(); await T.browser.close(); process.exit(0);
})().catch((e) => { console.error("FATAL", e.message.split("\n")[0]); process.exit(1); });
