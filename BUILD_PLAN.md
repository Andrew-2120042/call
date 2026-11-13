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
- [ ] 3. Waitlist (new):
  - schema: WaitlistEntry (eventTypeId, desired startTime/endTime, name, email, phone?, status WAITING/OFFERED/CLAIMED/EXPIRED/REMOVED, offerToken, offerExpiresAt, createdAt)
  - event type setting: waitlist enabled (metadata or column)
  - public API: join waitlist for a taken slot (validate slot really is taken, dedupe, rate limit)
  - on booking cancelled/rejected/rescheduled-away → offer slot to next WAITING entry (email with claim link, expiry e.g. 2h), move to next on expiry
  - claim endpoint: verifies token + slot still free → creates booking via normal booking flow (respects requiresConfirmation) → CLAIMED
  - owner: list + remove entries (tRPC), email notifications
  - tests + e2e verification
- [ ] 4. Confirm-or-release (new):
  - event type setting: require attendee confirmation N hours before (+ action on miss: notify owner | release slot)
  - scheduled job (cron endpoint secured by CRON_API_KEY) sends confirm emails, then on deadline marks unconfirmed → notify owner / cancel + offer to waitlist
  - attendee confirm link endpoint (signed token)
  - tests + e2e
- [ ] 5. Reminders: email reminders before booking (24h, 1h configurable) via cron job; no duplicates (sent log); tests + e2e
- [ ] 6. AI request helper: summary + spam/low-fit flag for pending requests (Anthropic API, model from env, graceful no-op without key); shown to owner in email + booking; tests (mock LLM)
- [ ] 7. Pro plan: plan field on user, feature gating (approval, screening beyond 1 form, waitlist, confirm-or-release, AI, custom domain, branding removal), Polar checkout + webhook (signature verified) → plan updates; tests
- [ ] 8. Owner-facing pages for new features (functional, not polished): waitlist list, settings toggles per event type
- [ ] 9. Full regression: booking flows, cancel/reschedule, emails, type-check whole repo, unit tests for touched packages
- [ ] 10. Production readiness: env docs, migrations, cron setup docs, security review of new endpoints

## Log
- 2026-11-13: items 0–2 done.
