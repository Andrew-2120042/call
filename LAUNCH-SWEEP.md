# Launch sweep: what was tested and what's left

Full check of Slotwise on 2026-11-16, run against the local app (`localhost:3000`, local Postgres, local mail catcher `.dev-mail`). Read this before re-testing anything: everything under "Verified" was exercised end to end in a real browser, as separate people, and checked against the database and the emails actually sent.

Companion files: `LAUNCH-TODO.md` (what still has to be set up) and `DEPLOY.md` (how).

## Result in one line

**150 browser checks across 18 flows pass, 4,315 unit tests pass, type check passes.** No product bug is open from the sweep except the three items under "Found, not fixed". The real launch blockers are accounts and keys, not code.

## How to re-run

The scripts are in `scripts/launch-sweep/`. They need the dev server on :3000, the mail catcher writing to `.dev-mail`, and the seeded users (`pro`/`pro`, `free`/`free`, `teampro`/`teampro`).

```bash
node scripts/launch-sweep/s1.cjs          # sections 1-5
node scripts/launch-sweep/s2.cjs          # sections 6-12
node scripts/launch-sweep/s3.cjs          # sections 13-16
node scripts/launch-sweep/s2.cjs 8,12     # only some sections
node scripts/launch-sweep/wl-e2e.cjs /tmp/out       # waitlist, 21 checks
node scripts/launch-sweep/invite-e2e.cjs /tmp/out   # team invites, 22 checks (needs /tmp/out/avatar.png)
TZ=UTC node_modules/.bin/vitest run       # unit tests
yarn type-check:ci --force
```

Notes for whoever runs them:
- Each run uses fresh `name+xxxx@example.com` addresses, so runs don't collide.
- The scripts create real bookings on the `pro` test account. Cancel them afterwards (see "Test data" below).
- A first run after a server restart is slow (pages compile on first visit). A script that seems stuck is usually waiting on that.
- If a run is killed half way, clear held slots before the next one: `delete from "SelectedSlots"`.

## Verified (all passing)

| # | Flow | What was proven |
|---|---|---|
| 1 | Sign up | Account created, verify-email page, verification email arrives and works, first-time setup, 3 default services, time zone from the browser, starts on Free |
| 2 | Log in | Wrong password refused, right one works, signed-out visitors bounced to login |
| 3 | Instant booking | Confirmed at once, client and host emails, shows in Upcoming, the time disappears for others, Free shows the Slotwise badge |
| 4 | Reschedule and cancel | New booking made, old one closed and marked rescheduled, rescheduled email, cancel works, cancellation email has "Pick a new time", host told, 3 AI rebook suggestions, "Book this time" opens the pre-filled form |
| 5 | Approval requests + AI | Booking is pending, client sees "request sent", AI summary written, host email waits for the summary and contains it, AI label in the Unconfirmed list, request page has summary/reply/Accept/Decline, "Send reply" emails the client with reply-to the host, Accept confirms and emails, Decline rejects and emails |
| 6 | Confirm-or-release | "Are you still coming?" email, opening the link alone doesn't confirm (safe from email scanners), the button confirms, missed deadline recorded, unconfirmed booking released, confirmed one untouched, late link says too late, host told |
| 7 | Reminders | Sent when due, never sent twice on repeated runs |
| 8 | Team bookings + team AI | Round robin books one member who gets the email, group booking includes all 5, AI routes with a reason, button hides after answering, "who's free" answers, "book that time" opens the form on that slot |
| 9 | Plans | Free can't switch on the waitlist (server refuses), told to upgrade, billing shows Free / $12 / $49 |
| 10 | Host screens | All 29 load with no errors: Home, calendar Home demo, Assistant, Services and editor tabs, all 5 booking tabs, search, Availability, Waitlist, Teams, Apps, and every Settings page |
| 11 | Public pages on a phone | 9 pages at 390px wide: no errors, no sideways scroll. 6 kinds of bad link (unknown person, service, booking, team, waitlist link, invite link) show a friendly not-found |
| 12 | Webhooks | Booking fires `BOOKING_CREATED` with a valid `X-Slotwise-Signature-256` |
| 13 | Setup Assistant | Asked for a 45-minute service by name: it was created on the right account |
| 14 | Service editor | Title change saves, public page shows it, live phone preview present |
| 15 | Forgot password | Reset email, new password works, link is single-use, unknown email reveals nothing |
| 16 | Two people, same time | Both submit the same slot at once: exactly one gets it, the other is told it's taken |
| 17 | Waitlist (21 checks) | In order, first come first served, "any time that day", "earlier than my booking", place-in-line shown before joining, host setting |
| 18 | Team invites (22 checks) | Email invite for a new person, for an existing account, the shareable `/join/<token>` link, live "just joined" on the owner's open page, photos on the public team page, 10-seat limit |

Also verified:
- **Cron endpoints:** all six `/api/cron/*` jobs return 200 with the key and 401 without. `/api/tasks/cron` returns 200 with its bearer secret and 401 without.
- **Landing site (:3100):** home, pricing, docs, blog, privacy, terms, sitemap, robots, llms.txt all 200. All 35 sitemap pages 200. All 32 links on the home page work.
- **Unit tests:** 432 files, 4,315 tests pass. The run exits non-zero only because vitest picks up a compiled test file inside a stale `apps/web/.next` build folder ("Page /api/book/recurring-event.test does not export a default function"). Delete `apps/web/.next` before running and it goes away. It is not a failing test.
- **Type check:** `yarn type-check:ci --force` passes, 9 of 9 packages.

## Fixed during the sweep

- **`DEPLOY.md` was wrong about the task runner.** `/api/tasks/cron` must be called with **GET**; POST returns 405. With POST, the host's "new request" email (the one carrying the AI summary) would never have been sent in production. The doc now says GET.

## Found, not fixed

1. **No video key means an "[Action Required]" email to the host on every booking.** Services default to "Slotwise Video". Without `DAILY_API_KEY` the link can't be made and the host gets a "couldn't create the meeting" email each time. A recurring booking of 12 sessions sent 12. Bookings still go through. This is the video key item in `LAUNCH-TODO.md`; treat it as a hard blocker.
2. **"Who's free" can name people who can't take the booking.** The team page AI lists any free team member, but the "Book" button goes to a service whose hosts may be a smaller group. Seen with two new members who weren't hosts of the round-robin service. Fix: limit the list to the suggested service's hosts (`TeamRoutingService.availabilityFor`).
3. **A held slot can look bookable on a round-robin service.** After killed test runs left slots held, the round-robin page still showed a held time and booking it failed with "This slot is no longer available". Holds expire in minutes, and it didn't reproduce once they were cleared. Worth one deliberate re-test: person A selects a time, person B opens the same service.

## Not tested (needs real accounts or keys)

These can't be checked locally. Test each one as soon as its key exists:
- **Real email delivery** (spam folder, dark mode in Gmail/Apple Mail/Outlook). Everything above used the local catcher.
- **Google and Outlook calendar sync:** busy times blocking slots, events written to the calendar, the calendar-health warning.
- **Video links** (Daily, Meet, Zoom).
- **Polar checkout:** buying Pro and Team, the webhook upgrading the account, cancelling.
- **Rate limiting:** `UNKEY_ROOT_KEY` is empty, so limits aren't enforced locally.
- **Custom domains** (needs DNS and Vercel).
- **Zapier and Make apps** against a live server.
- **Google sign-in** (off).
- **Payments / deposits** (Stripe, parked).
- **Production build under real load**, and the cron scheduler actually firing.

Also not re-checked in the browser: a Free account trying to **create** a team. The test user had been added to a team by then, so the empty-state check didn't apply. The unit test "needs the Team plan" covers the server rule.

## Test data left behind

- The sweep's future bookings on `pro` were cancelled afterwards (51 of them). `pro` has 39 active future bookings left, all from earlier seed and demo data.
- Test accounts created: `sweep+xxxx@`, `newbie+xxxx@`, `linker+xxxx@example.com`. Harmless locally.
- Seeded Team has 8 members (5 original + 3 from the invite test).
- `teampro` has the demo Team plan `demo-team-sub`. Remove before production.
- None of this exists outside the local database.
