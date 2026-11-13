# Slotwise build plan: autonomous loop checklist

Work through this list top to bottom. A feature is done only when it is built, covered by unit tests,
type-checked, verified end to end on the running app (real HTTP / browser, emails checked in
`.dev-mail/`), and committed. Update this file after each step. UI polish is NOT a goal yet;
functionality and correctness are. Read `NOTES.md` for decisions and environment.

## Environment (restart if not running)
- App: `corepack yarn dev` → http://localhost:3000 (owner login pro@example.com / pro).
- Mail catcher: `node scripts/dev/smtp-sink.mjs` → `.dev-mail/*.eml`.
- DB: `psql -h localhost -d slotwise_dev`. Test service: EventType id 3 (`/pro/30min`).
- Keep the Mac cool: `nice -n 15`, one heavy job at a time.

## Checklist
- [x] 0. Engine running, rebrand, branding leftovers fixed (emails, footer, video name)
- [x] 1. Booking requests you approve: request → PENDING, owner + client emails, Confirm, Reject with reason (verified in UI + emails)
- [x] 2. Screening questions: required answers enforced (400 on missing), answers in owner email + booking page, option fields show labels (getOptionDisplayValue) — verified e2e
- [x] 3. Waitlist: join/offer/expire/claim/remove + emails + cron + owner tRPC + settings toggle — 19 unit tests, verified live (join errors, cancel→offer, claim→booking via normal flow, reuse blocked, cron expiry→next person, auth 401s)
- [x] 4. Confirm-or-release: settings (validated 1–168h), request emails via cron, confirm page/API, missed → host alert or release via cancel service → waitlist offer — 10 unit tests, verified live end to end
- [x] 5. Reminders: per-service offsets (default 24h), exactly-once via unique sent log, no stale/late reminders, cron — 8 unit tests + shared cron auth (3 tests), verified live
- [x] 6. AI request helper: async cron triage (summary/fit/spam/concerns/reply) via Anthropic SDK structured output + fallbacks, injection-fenced, host-scoped read — 8 unit tests; live: no-key no-op, auth 401s, real SDK call with invalid key handled. NEEDS a real ANTHROPIC_API_KEY to see real output.
- [x] 7. Plans/billing: PlanSubscription via signed Polar webhooks (verifier cross-checked vs official SDK), effective-plan rules w/ grace, settings guard (403) + runtime gating, checkout/portal/plan API — 29+ tests; live: bad sig 403, upgrade→PRO unlocks, duplicate ignored, revoke→FREE→403. Needs real Polar products + token to sell.
- [x] 8. Owner screens: booking-rules card (verified save), billing page, waitlist page, public join page (verified join + email), AI panel for host only (verified) — functional; redesign later
- [x] 9. Full regression: whole-monorepo type-check clean; 1240 existing unit tests pass (bookings, lib, emails, i18n, event types, trpc); live: instant booking, approve/reject, cancel, reschedule (frees slot → waitlist offer), all emails checked
- [x] 10. Production readiness: DEPLOY.md (infra, env, migrations, crons, Polar, security notes, launch checklist); production build passes after fixing Biome-added node:process imports in client/edge files (+ guard test); production server smoke-tested (pages, auth redirects, webhook 403, all crons auth'd)

## Round 2 (requested 2026-11-14)
- [x] 11. Waitlist inside the booking calendar: booker shows "Time taken? Join the waitlist" (with the day preselected) when the service has a waitlist and the host is entitled
- [ ] 12. Remove branding (Pro): hiding the "Booking by"/powered-by badge is gated to Pro server-side and actually hides it on booking page, emails and embeds
- [ ] 13. Custom domains (Pro): CustomDomain model, DNS TXT verification, host-based routing middleware (book.yourname.com → owner page), Vercel domain API hook (documented), settings UI
- [ ] 14. Calendly import: owner pastes a Calendly personal access token → import event types (name, duration, description, slug) + weekly availability; idempotent, preview before import; mocked-API tests
- [ ] 15. Calendar sync health check: cron checks every connected calendar, marks broken ones, emails the owner once, shows a status badge + "reconnect" on the calendars page
- [ ] 16. Design: Usuals-style public booking page + Linktree-style owner dashboard (from design/ prototypes)

## Log
- 2026-11-13: all items 0–10 done. Remaining work needs the user: real name/logo, Anthropic key, Polar products/token, hosting + email domain, UI redesign (Linktree-style dashboard + Usuals-style booking page).
