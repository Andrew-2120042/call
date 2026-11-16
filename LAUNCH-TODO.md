# Launch to-do

Everything still needed before Slotwise goes live. Tick items off as they're done. How to set each one up is in `DEPLOY.md`.

## Accounts and keys (the owner signs up; Claude wires them in)
- [ ] **Domain**: buy it, then replace the `slotwise.example` placeholders (landing `src/site.config.ts` env vars, app URLs).
- [ ] **Hosted database**: Supabase or Neon Postgres. Turn on backups (Supabase Free has none, Pro $25/mo has daily backups). Run `db-deploy`.
- [ ] **Email provider**: Resend (Free: 3,000/month, max 100/day; Pro $20/mo: 50,000/month). Verify the domain (SPF, DKIM, DMARC) and set `EMAIL_SERVER_*` and `EMAIL_FROM`.
- [ ] **Video key (Daily.co)**: `DAILY_API_KEY`. New services default to "Slotwise Video", so without it bookings have no meeting link **and the host gets an "[Action Required]" error email for every booking** (confirmed in the sweep). Hard blocker.
- [ ] **Google and Microsoft calendar apps**: OAuth clients, then `seed-app-store`. Google's calendar-scope verification can take weeks, so start early.
- [ ] **Billing moves from Polar to Dodo Payments** (owner's decision, 2026-11-16). The app's checkout, customer portal and webhook are written for Polar today, so this is code work: a Dodo gateway and webhook to replace `polarGateway.ts` / `polarWebhook.ts`. Then create Pro ($12) and Team ($49) products in Dodo test mode, set the keys and webhook, and test a purchase before going live. Dodo: no monthly fee, 4% + 40¢ per US sale (+1.5% international, +0.5% subscriptions).
- [ ] **Rate limiting (Unkey)**: `UNKEY_ROOT_KEY`. Without it the public forms aren't protected from spam.
- [ ] **Hosting (Vercel)**: two projects, app (`apps/web`) and landing (`landing`).
- [ ] **Scheduler for background jobs**: the cron endpoints in `DEPLOY.md` §4 (reminders, waitlist offers, confirmations, AI summaries, task runner).
- [ ] **Legal review** of the privacy and terms pages.
- [ ] **Anthropic key** for production (`ANTHROPIC_API_KEY`), with a spend limit.

## Product work Claude can do when asked
- [ ] Weekly view on the booking page opens at the start of working hours, not the current time.
- [ ] Optionally hide the "Experimental" Recurring tab and "Overlay my calendar" for a cleaner booking page.
- [ ] Error monitoring (Sentry) so crashes after launch are visible.
- [ ] Publish the Zapier and Make apps (built in `integrations/`, not listed yet). Webhooks already work.
- [ ] Turn on "Sign in with Google".
- [ ] Independent review of the Teams code (commits b6f814b..616d896), then the full test suite and a production build as a final check.
- [x] Waitlist improvements: first-come-first-served option, shorter windows for soon slots, "any time that day" and "earlier than my booking" (done 2026-11-16, tested end to end).
- [ ] Remove the demo Team plan `demo-team-sub` on the `teampro` test account before production (it only exists in the local database).
- [ ] Extra seats on the Team plan: $49 covers 10 people; each person after that is $10/month per seat (needs a Dodo seat add-on and lifting the hard 10-seat stop in `TeamService`). Not started.
- [ ] From the launch sweep (see `LAUNCH-SWEEP.md`): "Who's free" on the team page should only list hosts of the service it offers to book.
- [ ] From the launch sweep: re-test a round-robin time that another visitor is holding (it showed as bookable, then failed).
- [ ] The task runner cron (`/api/tasks/cron`) must be scheduled as **GET**, not POST.
- [ ] After each key is added, run the matching "Not tested" item in `LAUNCH-SWEEP.md` (real email, calendar sync, video, Dodo checkout, rate limits, custom domains).
