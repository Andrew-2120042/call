const L = require("./lib.cjs");
(async () => {
  const T = await L.start();
  const p = await T.person();
  await p.goto(L.APP + "/auth/login", { timeout: 300000 }); await p.waitForTimeout(2500);
  const btn = p.getByRole("button", { name: /google/i });
  L.check("Login page shows 'Sign in with Google'", (await btn.count()) > 0);
  if (await btn.count()) {
    await btn.first().click();
    await p.waitForURL((u) => u.hostname.includes("google.com"), { timeout: 60000 }).catch(() => {});
    const u = new URL(p.url());
    L.check("It sends people to Google with Slotwise's client", u.hostname === "accounts.google.com" && /345609260807-/.test(p.url()) && /api%2Fauth%2Fcallback%2Fgoogle|api\/auth\/callback\/google/.test(decodeURIComponent(p.url())), u.hostname);
  }
  const h = await T.login("pro@example.com", "pro");
  const r = await h.goto(L.APP + "/api/integrations/googlecalendar/add", { timeout: 300000 });
  const body = await h.locator("body").innerText().catch(() => "");
  const url = (body.match(/https:\/\/accounts\.google\.com[^"\s]+/) || [h.url()])[0];
  L.check("'Connect Google Calendar' builds a Google consent link for our app", /accounts\.google\.com/.test(url) && /345609260807-/.test(url) && /calendar/.test(decodeURIComponent(url)), new URL(url).hostname);
  L.summary(); await T.browser.close(); process.exit(0);
})();
