# Slotwise: project notes (read first)

"Slotwise" is a **placeholder name**. Rename by changing `NEXT_PUBLIC_APP_NAME` in `.env` plus the brand assets.

## The product
**A booking tool where you decide who gets on your calendar.** It is built for solo service businesses: consultants, coaches, freelancers, creators, therapists, beauty and wellness pros.

The product is NOT "a cheaper Cal.com". Cal.diy is only the scheduling engine underneath: calendar sync, availability, slots and the booking pages.

**The four core features. No competitor combines all four in one cheap, good-looking solo product:**
1. **Booking requests you approve.** The client requests a slot, and the owner approves or declines. Calendly users have asked for this for years, and Calendly's staff say there is no native option.
2. **Screening questions / intake forms** before booking, with conditional questions and file uploads. Calendly only offers this on its Teams plan ($16–20/seat).
3. **Waitlist that auto-fills cancellations.** When a slot opens, waitlisted clients are notified and the first to claim it gets it.
4. **Confirm-or-release.** The client must confirm before a deadline. If they don't, the owner is alerted and the slot can go back to the waitlist.

Plus:
- An **AI helper on each request**: a summary, a spam/low-fit flag and a drafted reply. It is a quiet helper, not the headline.
- **Good-looking, customizable pages:** basic customization is free; custom domain and no badge are Pro.

### Competitors (as of 2026-11-13)
- **Acuity:** intake forms and waitlist, but no approval.
- **Cal.com:** "requires confirmation", but screening forms are a team feature.
- **Orbit AI, Zeeg:** forms, AI qualification and booking.
- **HoneyBook:** inquiry → proposal → booking, $16+/mo.
- **Calendly:** no approval at all. Its routing forms are Teams-only.

### Demand evidence
- Google autocomplete returns: "calendly approval required", "calendly manual approval", "calendly approve booking", "calendly intake form", "calendly screening/qualifying questions", "calendly waitlist", "acuity waitlist", "calendly confirm appointment".
- Calendly community threads request approval and were never built.
- Freelancers glue together form + AI + Calendly for $20–30/mo.
- Weak or no demand: "inquiry" wording, rebook reminders, review requests. These are later or never.
- Not yet proven: willingness to pay. That needs about 20 user conversations or a waitlist landing page.

## Pricing
- **Free:** 1 person, unlimited event types, basic customization, 1 screening form, email reminders, badge.
- **Pro, $12/mo:** approval requests, screening forms (unlimited, conditional), waitlist auto-fill, confirm-or-release, AI request helper, SMS/WhatsApp reminders, custom domain, no badge, Calendly import.
- **Team, $49/mo flat for up to 10 people:** later.
- **Deposits, card-on-file and no-show fees:** built and tested in Stripe test mode, but switched on only after a US entity exists.
  - That needs a US LLC (~$100–250 DIY or Atlas ~$500), funded from revenue.
  - Remember the yearly Form 5472 for a foreign-owned LLC.
- **HIPAA tier:** built but parked.

## Decisions the user has made
- **No "open source" marketing.** Keep the MIT notice in `LICENSE` and remove all Cal.com / Cal.diy branding.
- **Not an MVP:** everything ships production-ready, with tests, types, error handling and polish.
- **Solo businesses first, US audience.** No enterprise sales.
- **Our billing:** Polar (merchant of record, same as WhoIsCooking).
- **Owners' payments:** owners connect their own Stripe through **Stripe Connect** (the upstream OAuth flow).
  - **Never** ask owners to paste API keys. The user rejected that.
  - The user's Stripe is an Indian individual account, which can't be a Connect platform for US accounts. So develop with a Stripe test-mode account set to the US, and use a US entity for launch.
- **SMS:** Twilio, after toll-free verification. Before that, email and WhatsApp.

## What the engine (Cal.diy) already gives us
- Booking pages, availability and slots.
- Google, Apple, Outlook and CalDAV calendars.
- Embeds, webhooks and integrations.
- Stripe HOLD (card on file), `chargeCard`, `handleNoShowFee`, the no-show email and no-show marking.
- PayPal.
- Likely "requires confirmation" (to verify), which is the base for feature #1.

What it removed: Teams, Organizations, Workflows (and with them SMS), SSO and Insights.

## Phases
1. **Run the engine locally:** a booking flow end to end. (in progress)
2. **Rebrand + design system:** our name, logo and look, plus free customization (themes, fonts, logo, layout presets, badge).
3. **The core four:** approval requests → screening forms → waitlist auto-fill → confirm-or-release. Includes email/WhatsApp reminders and the AI request helper.
4. **Pro billing with Polar**, custom domain, Calendly import, sync health check.
5. **Production launch:** hosting, hardening, monitoring, backups, landing page.
6. **Later:** deposits / no-show fees (US entity), SMS, Team plan, HIPAA tier (parked).

## Local dev
- Postgres: Homebrew `postgresql@17`, database `slotwise_dev`, user `andrewwilson`, port 5432.
- `.env` is gitignored and holds generated secrets.
- Yarn is not installed globally, so always run `corepack yarn …`.
- The Mac must stay cool: run heavy jobs one at a time with `nice -n 15`. Never run builds in parallel.
- The repo path contains a space ("my projects"). Because of that, the app-store CLI's Biome step logs "internalError/io" and leaves `*.generated.ts` unformatted. That is harmless and matches upstream, which commits those files unformatted.
  - Do NOT "fix" it: formatting them causes ~700 lines of diff against upstream and merge conflicts.
- Repo conventions: see `CLAUDE.md` / `AGENTS.md`. Use `select` not `include`, never `as any`, put UI strings in `packages/i18n/locales/en/common.json`, and run Biome and type-checks.
