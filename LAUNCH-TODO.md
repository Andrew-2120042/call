# Launch to-do

Everything still needed before Nodslot goes live. Tick items off as they're done. How to set each one up is in `DEPLOY.md`.

## Main (do these first)
1. [ ] **Zoom**: the owner signs in at marketplace.zoom.us (Ego tab "Zoom app for Nodslot"); then Claude registers the app (redirect `https://app.nodslot.site/api/integrations/zoomvideo/callback`) and adds its keys to production.
2. [ ] **Polar**: the owner gives the Polar access key so billing turns on. Until then everyone is on Free.
3. [ ] **support@nodslot.site** has no inbox: the owner picks where those emails should go (Resend receiving, forwarding to Gmail, or a different address).

## Come back to (owner asked to be reminded, 2026-11-19)
- [ ] **Redesign the landing page.** It reads like a tech tool; it should feel like a calendar and show the product. Layout like Apollo's site (recording `~/Desktop/Screen Recording 2026-11-19 at 8.58.54 PM.mov`, frames in `docs/design-refs/landing-layout-apollo.jpg`): big product-demo blocks, a UI mock beside each feature's text, a row of 4 feature cards, customer stories, a huge closing banner, a big footer. Colours like Cal.com's (recording `... 8.57.34 PM.mov`, `docs/design-refs/landing-colours-calcom.jpg`): black or near-black, not Apollo's bright colours, with calendar pieces inside the headline (a photo, a clock, an "Intro call · 30m · Booked" chip) and a real app screenshot under it.
- [ ] **Slack**: post new bookings, requests and cancellations to a channel, with Accept/Decline buttons. Needs the owner to create a Slack app at api.slack.com/apps (Claude gives the exact settings).
- [ ] **ClickUp**: a task for each booking. Needs a ClickUp OAuth app from the owner.
- [ ] **Microsoft Teams links**: the Teams app (`msteams`) is built but switched off; needs the Microsoft app tested live with the online-meetings permission.
- [ ] **Clients leave a waitlist themselves** (a "leave" link in their email). The only gap found in the waitlist.
- [ ] **Future, not now: an MCP server for AI agents** (like Cal.com's `mcp.cal.com`): voice and chat agents connect, check real availability and book on the owner's page, signing in with OAuth and using their own AI tokens.

## Live status (2026-11-19)
Nodslot is live: landing at https://nodslot.site, app at https://app.nodslot.site (Vercel Hobby, team `andrew-0da0`, projects `nodslot` and `nodslot-landing`). Database: Neon (`nodslot-db`, iad1, Free) via the Vercel Marketplace. Live smoke test: `node scripts/launch-sweep/prod-smoke.cjs` (11 checks). How deploys work is in the memory note "deploy-process" and `DEPLOY.md`.

## Accounts and keys (the owner signs up; Claude wires them in)
- [x] **Domain** `nodslot.site` (GoDaddy, bought 2026-11-17). DNS: website, `app.` subdomain, Resend DKIM and SPF.
- [x] **Hosted database**: Neon via Vercel. All migrations applied, apps seeded. Neon Free has limited backups; upgrade before real customer data matters.
- [x] **Email (Resend)**: `nodslot.site` verified; mail goes out from `notifications@nodslot.site`. Still to do: `support@nodslot.site` has no inbox (set up Resend receiving or forwarding, or change the support address).
- [x] **Built-in video removed** (2026-11-19, owner: "no one asked for this"). Daily app disabled in the database, `DAILY_API_KEY` removed from Vercel. Hosts use Google Meet, Zoom or Teams; with none, bookings simply have no link.
- [~] **Google**: production redirect URIs and consent screen name done. Still in testing mode: submit for verification before more than 100 people connect.
- [~] **Microsoft**: app registered, `MS_GRAPH_*` keys set in production. Not yet tested live (Outlook connect, Teams links).
- [ ] **Zoom**: needs the owner to sign in at marketplace.zoom.us (an Ego tab "Zoom app for Nodslot" was opened), then Claude registers the app (redirect `https://app.nodslot.site/api/integrations/zoomvideo/callback`) and adds the keys.
- [ ] **Billing (Polar)**: `POLAR_ACCESS_TOKEN` still empty, so billing is off and everyone is Free. Pro $12, Team $69 for 10 people then $10 per extra person. Checkout never tested end to end.
- [x] **Rate limiting (Unkey)** set in production.
- [x] **Hosting (Vercel)**: both projects live, prebuilt deploys from this machine.
- [x] **Background jobs**: 9 jobs on cron-job.org (task runner and AI summaries every 2 min; waitlist, confirmations, reminders, webhooks every 10 min; calendar health 30 min; host request reminders hourly; task cleanup daily). Hobby only allows daily Vercel crons, so `apps/web/vercel.json` is empty.
- [x] **Anthropic key** set in production. Set a spend limit in the Anthropic console.
- [ ] **Legal review** of the privacy and terms pages.
- [ ] **Vercel Hobby is non-commercial.** Move to Pro (or Railway/Render) once there is a paying user.

## Product work Claude can do when asked
- [ ] Weekly view on the booking page opens at the start of working hours, not the current time.
- [ ] Optionally hide the "Experimental" Recurring tab and "Overlay my calendar" for a cleaner booking page.
- [ ] Error monitoring (Sentry) so crashes after launch are visible.
- [ ] Publish the Zapier and Make apps (built in `integrations/`, not listed yet). Webhooks already work.
- [ ] Turn on "Sign in with Google".
- [ ] Independent review of the Teams code (commits b6f814b..616d896), then the full test suite and a production build as a final check.
- [x] Waitlist improvements: first-come-first-served option, shorter windows for soon slots, "any time that day" and "earlier than my booking" (done 2026-11-16, tested end to end).
- [ ] Remove the demo Team plan `demo-team-sub` on the `teampro` test account before production (it only exists in the local database).
- [ ] Extra seats on the Team plan (price decided 2026-11-19): $69 covers 10 people; each person after that is $10/month per seat (needs a Dodo seat add-on and lifting the hard 10-seat stop in `TeamService`). Not started.
- [ ] From the launch sweep (see `LAUNCH-SWEEP.md`): "Who's free" on the team page should only list hosts of the service it offers to book.
- [ ] From the launch sweep: re-test a round-robin time that another visitor is holding (it showed as bookable, then failed).
- [ ] The task runner cron (`/api/tasks/cron`) must be scheduled as **GET**, not POST.
- [ ] After each key is added, run the matching "Not tested" item in `LAUNCH-SWEEP.md` (real email, calendar sync, video, Dodo checkout, rate limits, custom domains).
- [ ] **Where production keys live:** `.env.launch-keys` at the repo root (git-ignored). Copy its values into Vercel's environment variables at deploy time; never commit it.
- [ ] `packages/prisma/.env` points at a different database than the root `.env`, so `seed-app-store` fails with P1003 unless run with `DATABASE_URL` set. Fix the file or always pass the URL.
- [ ] **Dodo:** the existing Dodo account is the business "usuals". Decide whether Nodslot sells under it or gets its own business (its own verification) before products are created.
- [ ] **Zapier and Make:** accounts are logged in, but the apps can only be connected and published once the app has a public URL (after the domain and hosting).
- [x] **Help & feedback** in the sidebar (done 2026-11-17): saves to the `Feedback` table and emails `NEXT_PUBLIC_SUPPORT_MAIL_ADDRESS` with reply-to the sender. **Set that address to a real inbox before launch** (it defaults to `support@nodslot.site`).
- [x] **Real email delivery, first pass** (2026-11-17): 6 emails sent through Resend (API and SMTP) to the Resend account's own address, all "Delivered". **Still to do by a person:** open them in that inbox and check they didn't land in spam, and how they look in light and dark mode on phone and desktop. Repeat from the real domain once it's verified.
- [x] **Google, real test** (2026-11-17): calendar connected on the `teampro` test account, booking created an event, Google busy time blocked the slot, cancelling removed the event; "Sign in with Google" created a verified account. Scripts: `scripts/launch-sweep/gcal.cjs`, `google.cjs`.
- [ ] **All connections need one more pass on the live domain** (owner's note): Google with production redirect URLs, Microsoft once Azure exists, Resend from the real domain, Dodo checkout, Zapier and Make.
- [x] Google sign-in asks for calendar access as well as name and email: owner confirmed this is intended (2026-11-17).
- [x] **Security review** done 2026-11-17 (see "Security review" in `LAUNCH-SWEEP.md`): no leaks, no SQL injection, 44 live security checks passed (26 of them cross-account attacks, all refused); one gap fixed (rate limits on "Send reply" and invites).
- [ ] Security follow-ups: make sure `UNKEY_ROOT_KEY` is set in production (limits fail open without it); turn on a Content-Security-Policy; add a daily cap on outgoing reply/invite emails; confirm `/api/email` returns 403 on the live site.
