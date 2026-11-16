const { chromium } = require(process.cwd() + "/node_modules/playwright");
const fs = require("fs");
const crypto = require("crypto");
const { execSync } = require("child_process");
const OUT = process.argv[2];
const APP = "http://localhost:3000";
const EXE = process.env.HOME + "/Library/Caches/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell";
const MAIL = process.cwd() + "/.dev-mail";
const RUN = Date.now().toString(36).slice(-4);
const db = (sql) => execSync(`psql -At "postgresql://localhost:5432/slotwise_dev" -c ${JSON.stringify(sql)}`).toString().trim();
const results = [];
const check = (label, ok, detail = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? "  (" + detail + ")" : ""}`); };
const mailTo = (email, since, re) => {
  const files = fs.readdirSync(MAIL).filter((f) => f.endsWith(".eml")).map((f) => ({ f, t: fs.statSync(MAIL + "/" + f).mtimeMs })).filter((x) => x.t >= since).sort((a, b) => b.t - a.t);
  for (const { f } of files) {
    const raw = fs.readFileSync(MAIL + "/" + f, "utf8").replace(/=\r?\n/g, "").replace(/=3D/g, "=");
    if (!raw.toLowerCase().includes(email.toLowerCase())) continue;
    const m = raw.match(re);
    if (m) return { link: m[0].replace(/&amp;/g, "&"), subject: (raw.match(/^Subject: (.*)$/m) || [])[1] };
  }
  return null;
};
const membership = (email) => db(`select coalesce(m.accepted::text,'none') from users u left join "Membership" m on m."userId"=u.id and m."teamId"=1 where lower(u.email)=lower('${email}')`);
let step = 0;
const shot = async (p, name) => p.screenshot({ path: `${OUT}/${String(++step).padStart(2, "0")}-${name}.png` });

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  const ctx = (extra = {}) => browser.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: "Asia/Calcutta", colorScheme: "dark", ...extra });
  const onboard = async (p, name, photo) => {
    for (let i = 0; i < 8 && p.url().includes("/onboarding"); i++) {
      await p.waitForTimeout(1500);
      if (p.url().includes("/personal/settings")) {
        if (photo) {
          await p.getByTestId("open-upload-avatar-dialog").click();
          const chooser = p.waitForEvent("filechooser");
          await p.getByTestId("open-upload-image-filechooser").click();
          await (await chooser).setFiles(photo);
          await p.waitForTimeout(1200);
          await shot(p, "onboarding-photo-crop");
          await p.getByTestId("upload-avatar").click();
          await p.waitForTimeout(2500);
        }
        const nameInput = p.locator('input[name="name"]').first();
        if (await nameInput.count()) await nameInput.fill(name);
        await shot(p, "onboarding-details");
      }
      const next = p.getByTestId("onboarding-continue-btn");
      const skip = p.getByRole("button", { name: /skip|finish|continue|done|get started/i }).last();
      if (await next.isVisible().catch(() => false) && (await next.isEnabled())) await next.click();
      else if (await skip.isVisible().catch(() => false)) await skip.click();
      await p.waitForURL((u) => !u.pathname.includes("/personal/settings"), { timeout: 15000 }).catch(() => {});
    }
    await p.waitForTimeout(2500);
  };
  const login = async (p, email, pw) => {
    await p.locator('input[name="email"]').waitFor({ timeout: 120000 });
    await p.fill('input[name="email"]', email); await p.fill('input[name="password"]', pw);
    await p.click('button[type="submit"]');
  };

  // Owner invites two people by email and copies the invite link.
  const ownerCtx = await ctx({ permissions: ["clipboard-read", "clipboard-write"], recordVideo: { dir: OUT + "/owner-video", size: { width: 1280, height: 900 } } });
  const owner = await ownerCtx.newPage();
  await owner.goto(APP + "/auth/login", { timeout: 300000 });
  await login(owner, "teampro@example.com", "teampro");
  await owner.waitForURL((u) => !u.pathname.startsWith("/auth/login"), { timeout: 300000 });
  await owner.goto(APP + "/teams/1", { timeout: 300000 });
  await owner.getByTestId("invite-members-button").click();
  await owner.getByTestId("invite-emails-input").waitFor({ timeout: 60000 });
  const newbie = `newbie+${RUN}@example.com`;
  const existing = "free@example.com";
  await owner.getByTestId("invite-emails-input").fill(`${newbie}, ${existing}`);
  await shot(owner, "owner-invite-dialog");
  const since = Date.now();
  await owner.getByTestId("send-invites").click();
  await owner.waitForTimeout(3000);
  check("Owner's invite creates a pending membership for the new person", membership(newbie) === "false");
  check("…and for the person who already has an account", membership(existing) === "false" || membership(existing) === "true", membership(existing));
  await owner.getByTestId("invite-members-button").click().catch(() => {});
  await owner.getByTestId("copy-invite-link").waitFor({ timeout: 60000 });
  await owner.getByTestId("copy-invite-link").click();
  await owner.waitForTimeout(800);
  const inviteLink = await owner.evaluate(() => navigator.clipboard.readText()).catch(() => "");
  check("Owner can copy a shareable invite link", /\/join\//.test(inviteLink), inviteLink.replace(/join\/.*/, "join/…"));
  // The owner leaves the team page open (no refresh) for the rest of the test.
  await owner.keyboard.press("Escape");
  await owner.goto(APP + "/teams/1", { timeout: 300000 });
  await owner.getByTestId("team-member-row").last().scrollIntoViewIfNeeded();
  await owner.waitForTimeout(1500);
  const watchJoin = async (label) => {
    const appeared = await owner.locator("[data-just-joined]").first().waitFor({ timeout: 15000 }).then(() => true).catch(() => false);
    const toast = await owner.getByText(/just joined the team/).first().isVisible().catch(() => false);
    check(`Owner's open team page shows ${label} joining live (no refresh)`, appeared && toast, `highlight=${appeared} toast=${toast}`);
    if (appeared) { await owner.locator("[data-just-joined]").first().scrollIntoViewIfNeeded(); await shot(owner, "owner-live-" + label); }
    await owner.waitForTimeout(7000);
  };

  // 1. Brand-new person invited by email
  console.log("\n--- New person, invited by email ---");
  let mail = null;
  for (let i = 0; i < 20 && !mail; i++) { mail = mailTo(newbie, since - 1000, /https?:\/\/[^\s"'<>]*\/signup\?token=[^\s"'<>]+/); if (!mail) await owner.waitForTimeout(500); }
  check("New person gets an invite email with a sign-up link", !!mail, mail?.subject);
  const n = await (await ctx()).newPage();
  await n.goto(mail.link, { timeout: 300000 });
  await n.getByTestId("signup-passwordfield").waitFor({ timeout: 120000 }).catch(async () => { await n.getByTestId("continue-with-email-button").click(); });
  await shot(n, "newbie-signup");
  const emailVal = await n.locator('input[name="email"]').inputValue();
  check("Sign-up form already has their email filled in", emailVal.toLowerCase() === newbie.toLowerCase(), emailVal);
  await n.locator('input[name="username"]').fill(`newbie${RUN}`);
  await n.getByTestId("signup-passwordfield").fill(crypto.randomBytes(9).toString("base64") + "aA1!");
  const cookie = n.getByTestId("signup-cookie-content-checkbox"); if (await cookie.count()) await cookie.check().catch(() => {});
  await n.getByTestId("signup-submit-button").click();
  await n.waitForURL((u) => !u.pathname.startsWith("/signup"), { timeout: 120000 }).catch(() => {});
  await n.waitForTimeout(3000);
  console.log("     after sign-up:", new URL(n.url()).pathname);
  check("After signing up they're a team member (accepted)", membership(newbie) === "true", membership(newbie));
  await watchJoin("newbie");
  await onboard(n, "Nadia Newbie", OUT + "/avatar.png");
  console.log("     after setup:", new URL(n.url()).pathname);
  check("After first-time setup they land on Teams", new URL(n.url()).pathname === "/teams", new URL(n.url()).pathname);
  await n.goto(APP + "/teams", { timeout: 300000 }); await n.getByTestId("team-row").first().waitFor({ timeout: 30000 }).catch(() => {});
  await shot(n, "newbie-teams-page");
  check("Their Teams page lists the team", (await n.getByTestId("team-row").count()) > 0);
  const avatar = db(`select coalesce("avatarUrl",'') from users where lower(email)=lower('${newbie}')`);
  check("They can set a profile photo", !!avatar, avatar.slice(0, 60));

  // 2. Existing user invited by email
  console.log("\n--- Existing account, invited by email ---");
  mail = mailTo(existing, since - 1000, /https?:\/\/[^\s"'<>]*\/teams[^\s"'<>]*/);
  check("Existing user gets an invite email pointing to Teams", !!mail, mail?.subject);
  if (membership(existing) === "false") {
    const e = await (await ctx()).newPage();
    await e.goto(mail.link, { timeout: 300000 });
    await Promise.race([
      e.locator('input[name="email"]').waitFor({ timeout: 60000 }),
      e.getByTestId("team-invite-row").first().waitFor({ timeout: 60000 }),
    ]).catch(() => {});
    if (e.url().includes("/auth/login")) { await login(e, "free@example.com", "free"); await e.waitForURL((u) => u.pathname.startsWith("/teams"), { timeout: 120000 }).catch(() => {}); }
    await e.getByTestId("team-invite-row").first().waitFor({ timeout: 60000 });
    await shot(e, "existing-invite-row");
    await e.waitForTimeout(1500); await e.keyboard.press("Escape"); await e.waitForTimeout(800);
    await e.getByTestId("team-invite-row").first().locator("button", { hasText: /^Accept$/ }).click();
    await e.waitForTimeout(2500);
    check("They accept from their Teams page and become a member", membership(existing) === "true");
    await watchJoin("existing");
  }

  // 3. Brand-new person using the shareable link
  console.log("\n--- New person, using the invite link ---");
  const linker = `linker+${RUN}@example.com`;
  const l = await (await ctx()).newPage();
  await l.goto(inviteLink, { timeout: 300000 });
  await l.getByTestId("join-team-page").waitFor({ timeout: 60000 });
  await shot(l, "linker-join-page");
  check("Invite link opens a 'Join Seeded Team' page", /Join Seeded Team/.test(await l.locator("body").innerText()));
  await l.getByTestId("join-team-signup").click();
  await l.locator('input[name="email"]').waitFor({ timeout: 60000 });
  await l.locator('input[name="username"]').fill(`linker${RUN}`).catch(() => {});
  await l.locator('input[name="email"]').fill(linker);
  await l.getByTestId("signup-passwordfield").fill(crypto.randomBytes(9).toString("base64") + "aA1!");
  const sinceLink = Date.now();
  await l.getByTestId("signup-submit-button").click();
  await l.waitForURL((u) => !u.pathname.startsWith("/signup"), { timeout: 120000 }).catch(() => {});
  await l.waitForTimeout(2500);
  console.log("     after sign-up:", new URL(l.url()).pathname);
  check("Link joiner is in the team straight after sign-up", membership(linker) === "true", membership(linker));
  await watchJoin("linker");
  check("…but their email isn't marked verified until they confirm it", db(`select coalesce("emailVerified"::text,'') from users where lower(email)=lower('${linker}')`) === "");
  let verify = null;
  for (let i = 0; i < 20 && !verify; i++) { verify = mailTo(linker, sinceLink - 1000, /https?:\/\/[^\s"'<>]*verify-email[^\s"'<>]*|https?:\/\/[^\s"'<>]*\/api\/auth\/verify[^\s"'<>]*/); if (!verify) await l.waitForTimeout(500); }
  check("They get a verify-your-email message", !!verify, verify?.subject);
  if (verify) {
    await l.goto(verify.link, { timeout: 300000 });
    await l.waitForTimeout(3000);
    await onboard(l, "Leo Linker", null);
    console.log("     after verifying and setup:", new URL(l.url()).pathname);
    check("After verifying and setup they land on Teams", new URL(l.url()).pathname === "/teams", new URL(l.url()).pathname);
  }
  await shot(l, "linker-final");

  // Owner and public page
  console.log("\n--- Owner's team page and the public page ---");
  await owner.goto(APP + "/teams/1", { timeout: 300000 }); await owner.waitForTimeout(2500);
  const rows = await owner.getByTestId("team-member-row").allInnerTexts();
  check("Owner sees the new people in the member list", rows.some((r) => r.toLowerCase().includes("nadia") || r.toLowerCase().includes("newbie")) && rows.some((r) => r.toLowerCase().includes("linker")));
  await owner.getByTestId("team-member-row").last().scrollIntoViewIfNeeded(); await shot(owner, "owner-members");
  const pub = await (await ctx()).newPage();
  await pub.goto(APP + "/team/seeded-team", { timeout: 300000 }); await pub.waitForTimeout(2500);
  const imgs = await pub.evaluate(() => [...document.querySelectorAll("img")].map((i) => ({ src: i.getAttribute("src") || "", alt: i.alt, ok: i.complete && i.naturalWidth > 0 })));
  const newbieImg = imgs.find((i) => /nadia/i.test(i.alt));
  check("New member appears on the public team page", (await pub.locator("body").innerText()).toLowerCase().includes("nadia"));
  check("Their photo shows on the public page", !!newbieImg && newbieImg.ok, newbieImg ? newbieImg.src.slice(0, 50) : "no img with their name");
  await pub.mouse.wheel(0, 900); await pub.waitForTimeout(600); await shot(pub, "public-team-page");

  console.log(`\n${results.filter(Boolean).length} of ${results.length} checks passed`);
  await browser.close();
})().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
