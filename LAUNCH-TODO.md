# Launch to-do

Everything still needed before Calbee goes live. Tick items off as they're done. How to set each one up is in `DEPLOY.md`.

## Main (do these first)
1. [ ] **Zoom**: the owner signs in at marketplace.zoom.us (Ego tab "Zoom app for Calbee"); then Claude registers the app (redirect `https://app.nodslot.site/api/integrations/zoomvideo/callback`) and adds its keys to production.
2. [~] **Billing**: going with Dodo (owner, 2026-11-20); Polar code stays as a fallback. Until live keys are set in production, everyone is on Free.
3. [x] **Calbee name on the live server** (done 2026-11-23 via the Vercel CLI): in Vercel → nodslot project → Settings → Environment Variables (Production), set `EMAIL_FROM_NAME`, `NEXT_PUBLIC_APP_NAME` and `NEXT_PUBLIC_COMPANY_NAME` to `Calbee`, then redeploy. Until then emails come from "Nodslot". (Owner, added 2026-11-23.)
4. [ ] **Search and AI traffic** (built 2026-11-23): after the next website deploy, run `cd landing && npm run indexnow` (tells Bing, which feeds ChatGPT search and Copilot). Then the owner signs in to Google Search Console and Bing Webmaster Tools, adds the site, and submits `/sitemap.xml`. Repeat for the new domain once it's bought.
5. [ ] **support@nodslot.site** has no inbox: the owner picks where those emails should go (Resend receiving, forwarding to Gmail, or a different address).

## Advertised but not working (sweep 2026-11-20) — fix or take off the site before launch
- [ ] **Your own domain (Pro):** built (Settings → Plan & billing → Custom domain, TXT check, routing) but production has no `CUSTOM_DOMAIN_CNAME_TARGET` / `VERCEL_DOMAINS_*`, so a verified domain doesn't serve the page. Needs a Vercel token scoped to the team (owner creates it at vercel.com/account/settings/tokens).
- [ ] **Zoom links:** app disabled, no keys. Owner signs in at marketplace.zoom.us, then Claude registers the app.
- [ ] **Zapier and Make:** disabled; the website "works with" strip and FAQ mention them.
- [ ] **HubSpot, Salesforce, Pipedrive:** disabled (each needs its own developer app).
- [ ] **Slack, ClickUp:** not built; shown as "Not available yet" on the Apps page.
- [x] **Outlook calendar** tested 2026-11-23 with a real Outlook account: busy times hide slots, bookings appear in Outlook, cancelling removes them.
- [ ] **Microsoft Teams links:** Microsoft only lets work or school (Microsoft 365) accounts create Teams meetings through an app; personal accounts are refused (users now see a plain explanation). Needs a test with a work/school account.
- [ ] **Paying for Pro:** Dodo is in test mode and limited to the owner's two emails; nobody else can buy yet. Team checkout works in test mode (2026-11-23), including Pro → Team switching.
- [ ] **Support inbox:** `NEXT_PUBLIC_SUPPORT_MAIL_ADDRESS` is empty, so support@nodslot.site is used and it has no inbox.
- [ ] **Google:** published to production 2026-11-20 but unverified (warning screen, 100-user cap). Needs nodslot.site verified in Search Console (DNS TXT at GoDaddy), the calendar scopes declared, and a demo video.
- [ ] Live account 4 (`qaprobe128`, a test account) got Pro from a local test payment on 2026-11-20 (the bug is fixed); its PlanSubscription row should be deleted (owner to confirm).

## Found by the full test run (2026-11-23)
- [ ] **Repeating bookings:** if a later week of a weekly series is already taken, the whole series fails with "This slot is no longer available", but the first week is saved anyway. Comes from the underlying Cal booking engine. Fix: check every week before booking and say which week is taken.
- [x] Fixed: login page imported a server-only module; Teams connect error showed raw JSON; waitlist claim said "no longer available" when it was only a short rate limit; assistant labels mentioned a server key name.

## Later: needs payments (Stripe, after the US company is registered)

Decided 2026-11-24. Don't build these until Stripe is live.
- **Payments at booking**: already built and hidden in the app; switch on once Stripe is connected. Free on every plan, like Cal.com and TidyCal.
- **Deposits and card on file**: the fix people mention most for no-shows ("no payment, no commitment"). See MONEY-RESEARCH.md.
- **Late-cancel rules**: clients can't cancel themselves inside X hours, and a late cancel or no-show can keep the deposit.
- **Cancellation policy shown at booking**: only meaningful once a deposit is at stake.
- **Session packages (5-packs, 10-packs) and subscriptions**, like TidyCal and Calendly.

Not doing: text (SMS) reminders (cost per text, decided 2026-11-24), meeting polls, and a per-client reliability record.
Next big build after launch: the Claude/ChatGPT connector (MCP-PLAN.md).

## Come back to (owner asked to be reminded, 2026-11-19)
- [x] **Redesign the landing page** (done 2026-11-19/20: Apollo-style layout, dark, serif headings, own pricing page). It reads like a tech tool; it should feel like a calendar and show the product. Layout like Apollo's site (recording `~/Desktop/Screen Recording 2026-11-19 at 8.58.54 PM.mov`, frames in `docs/design-refs/landing-layout-apollo.jpg`): big product-demo blocks, a UI mock beside each feature's text, a row of 4 feature cards, customer stories, a huge closing banner, a big footer. Colours like Cal.com's (recording `... 8.57.34 PM.mov`, `docs/design-refs/landing-colours-calcom.jpg`): black or near-black, not Apollo's bright colours, with calendar pieces inside the headline (a photo, a clock, an "Intro call · 30m · Booked" chip) and a real app screenshot under it.
- [ ] **Slack** (listed on the Apps page as "Not available yet" since 2026-11-20): post new bookings, requests and cancellations to a channel, with Accept/Decline buttons. Needs the owner to create a Slack app at api.slack.com/apps (Claude gives the exact settings).
- [ ] **ClickUp** (listed on the Apps page as "Not available yet" since 2026-11-20): a task for each booking. Needs a ClickUp OAuth app from the owner.
- [ ] **Microsoft Teams links**: the Teams app (`msteams`) is built but switched off; needs the Microsoft app tested live with the online-meetings permission.
- [ ] **Clients leave a waitlist themselves** (a "leave" link in their email). The only gap found in the waitlist.
- [ ] **Future, not now: an MCP server for AI agents** (like Cal.com's `mcp.cal.com`): voice and chat agents connect, check real availability and book on the owner's page, signing in with OAuth and using their own AI tokens.

## Done 2026-11-20 (local, not deployed yet)
- Apple Calendar and CalDAV removed from the Apps page, onboarding and the website. Calendars are Google and Outlook only.
- Assistant can read every booking, count them, read availability, and move or cancel upcoming bookings. Guardrails: it must propose the exact changes first; the server only allows changes from the plan the owner was shown (hidden marker in the reply); 10 changes per turn; own upcoming bookings only; one-off bookings only (series are moved in the app).
- "Add booking" on the Home calendar opens an in-app form (service, free time, client, required questions) and books straight onto the calendar.
- Pro: a second rebooking email 3 days after a client cancels, if they haven't rebooked.
- Client-facing pages use a softer dark palette; dashboard content slightly larger; calendar side panel no longer scrolls the page behind it.
- Code is on GitHub: https://github.com/Andrew-2120042/call (public).

## Live status (2026-11-19)
Calbee is live: landing at https://nodslot.site, app at https://app.nodslot.site (Vercel Hobby, team `andrew-0da0`, projects `nodslot` and `nodslot-landing`). Database: Neon (`nodslot-db`, iad1, Free) via the Vercel Marketplace. Live smoke test: `node scripts/launch-sweep/prod-smoke.cjs` (11 checks). How deploys work is in the memory note "deploy-process" and `DEPLOY.md`.

## Accounts and keys (the owner signs up; Claude wires them in)
- [x] **Domain** `nodslot.site` (GoDaddy, bought 2026-11-17). DNS: website, `app.` subdomain, Resend DKIM and SPF.
- [x] **Hosted database**: Neon via Vercel. All migrations applied, apps seeded. Neon Free has limited backups; upgrade before real customer data matters.
- [x] **Email (Resend)**: `nodslot.site` verified; mail goes out from `notifications@nodslot.site`. Still to do: `support@nodslot.site` has no inbox (set up Resend receiving or forwarding, or change the support address).
- [x] **Built-in video removed** (2026-11-19, owner: "no one asked for this"). Daily app disabled in the database, `DAILY_API_KEY` removed from Vercel. Hosts use Google Meet, Zoom or Teams; with none, bookings simply have no link.
- [~] **Google**: published to production 2026-11-20 (branding links + nodslot.site authorized). Unverified: users see a warning and there's a 100-user cap until verification (needs declared scopes, Search Console domain check and a demo video).
- [~] **Microsoft**: app registered, `MS_GRAPH_*` keys set in production. Not yet tested live (Outlook connect, Teams links).
- [ ] **Zoom**: needs the owner to sign in at marketplace.zoom.us (an Ego tab "Zoom app for Calbee" was opened), then Claude registers the app (redirect `https://app.nodslot.site/api/integrations/zoomvideo/callback`) and adds the keys.
- [ ] **Billing (Polar)**: `POLAR_ACCESS_TOKEN` still empty, so billing is off and everyone is Free. Pro $12, Team $69 for 10 people then $10 per extra person. Checkout never tested end to end.
- [x] **Rate limiting (Unkey)** set in production.
- [x] **Hosting (Vercel)**: both projects live, prebuilt deploys from this machine.
- [x] **Background jobs**: 9 jobs on cron-job.org (task runner and AI summaries every 2 min; waitlist, confirmations, reminders, webhooks every 10 min; calendar health 30 min; host request reminders hourly; task cleanup daily). Hobby only allows daily Vercel crons, so `apps/web/vercel.json` is empty.
- [x] **Anthropic key** set in production. Set a spend limit in the Anthropic console.
- [ ] **Legal review** of the privacy and terms pages.
- [ ] **Vercel Hobby is non-commercial.** Move to Pro (or Railway/Render) once there is a paying user.

## Product work Claude can do when asked
- [x] Weekly view on the booking page opens at the start of working hours, not the current time (2026-11-23).
- [ ] Optionally hide the "Experimental" Recurring tab and "Overlay my calendar" for a cleaner booking page.
- [ ] Error monitoring (Sentry) so crashes after launch are visible.
- [ ] Publish the Zapier and Make apps (built in `integrations/`, not listed yet). Webhooks already work.
- [ ] Turn on "Sign in with Google".
- [ ] Independent review of the Teams code (commits b6f814b..616d896), then the full test suite and a production build as a final check.
- [x] Waitlist improvements: first-come-first-served option, shorter windows for soon slots, "any time that day" and "earlier than my booking" (done 2026-11-16, tested end to end).
- [ ] Remove the demo Team plan `demo-team-sub` on the `teampro` test account before production (it only exists in the local database).
- [ ] Extra seats on the Team plan (price decided 2026-11-19): $69 covers 10 people; each person after that is $10/month per seat (needs a Dodo seat add-on and lifting the hard 10-seat stop in `TeamService`). Not started.
- [x] From the launch sweep: "Who's free" on the team page only lists hosts of the service it offers to book (2026-11-23).
- [x] Re-tested 2026-11-23: a round-robin time held by visitor A is hidden from visitor B. The earlier failure came from stale holds left by killed test runs.
- [ ] The task runner cron (`/api/tasks/cron`) must be scheduled as **GET**, not POST.
- [ ] After each key is added, run the matching "Not tested" item in `LAUNCH-SWEEP.md` (real email, calendar sync, video, Dodo checkout, rate limits, custom domains).
- [ ] **Where production keys live:** `.env.launch-keys` at the repo root (git-ignored). Copy its values into Vercel's environment variables at deploy time; never commit it.
- [x] `packages/prisma/.env` is now a link to the root `.env` (one database).
- [~] **Dodo (2026-11-20):** billing code supports Dodo (used when `DODO_API_KEY` is set). Test mode is set up under "usuals": products "Calbee Pro" and "Calbee Team", API key "nodslot (test)", values in `.env` and `.env.launch-keys` (DODO_TEST_*). Checkout tested locally. Still to do: a Dodo webhook endpoint (needs a public URL, so on deploy) and a full paid test; move to the new name's own Dodo business after the rename. Previously: the existing Dodo account is the business "usuals". Decide whether Calbee sells under it or gets its own business (its own verification) before products are created.
- [ ] **Zapier and Make:** accounts are logged in, but the apps can only be connected and published once the app has a public URL (after the domain and hosting).
- [x] **Help & feedback** in the sidebar (done 2026-11-17): saves to the `Feedback` table and emails `NEXT_PUBLIC_SUPPORT_MAIL_ADDRESS` with reply-to the sender. **Set that address to a real inbox before launch** (it defaults to `support@nodslot.site`).
- [x] **Real email delivery, first pass** (2026-11-17): 6 emails sent through Resend (API and SMTP) to the Resend account's own address, all "Delivered". **Still to do by a person:** open them in that inbox and check they didn't land in spam, and how they look in light and dark mode on phone and desktop. Repeat from the real domain once it's verified.
- [x] **Google, real test** (2026-11-17): calendar connected on the `teampro` test account, booking created an event, Google busy time blocked the slot, cancelling removed the event; "Sign in with Google" created a verified account. Scripts: `scripts/launch-sweep/gcal.cjs`, `google.cjs`.
- [ ] **All connections need one more pass on the live domain** (owner's note): Google with production redirect URLs, Microsoft once Azure exists, Resend from the real domain, Dodo checkout, Zapier and Make.
- [x] Google sign-in asks for calendar access as well as name and email: owner confirmed this is intended (2026-11-17).
- [x] **Security review** done 2026-11-17 (see "Security review" in `LAUNCH-SWEEP.md`): no leaks, no SQL injection, 44 live security checks passed (26 of them cross-account attacks, all refused); one gap fixed (rate limits on "Send reply" and invites).
- [ ] Security follow-ups: make sure `UNKEY_ROOT_KEY` is set in production (limits fail open without it); turn on a Content-Security-Policy; add a daily cap on outgoing reply/invite emails; confirm `/api/email` returns 403 on the live site.
