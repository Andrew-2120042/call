# Product Hunt launch kit

Draft written 2026-11-20. Uses the current name "Nodslot"; swap in the new name after the rename.

## When

- **Time:** 12:01 AM Pacific, which is **1:31 PM India time**. Product Hunt's day runs midnight to midnight Pacific, so launching at 12:01 gets the full 24 hours.
- **Day:** for a first launch with a small audience, a **Saturday or Sunday** gives the best shot at a top-5 spot: fewer launches compete, though fewer people visit. Tuesday–Thursday brings the most visitors but also the strongest competition. Avoid Mondays.
- **Not before:** the rename is done, real payments work (Dodo live), and every item under "Blockers" is ticked. Launch traffic that hits a broken checkout or a feature we advertise but don't have is wasted, and the reviews stick.

## Blockers (must be true on launch day)

- [ ] New name everywhere (app, site, emails, Google consent screen, Dodo products).
- [ ] Dodo **live** mode: real Pro checkout works end to end, and the test-mode allow-list is removed.
- [ ] Nothing advertised that doesn't work: Zoom, Zapier/Make, "your own domain" and Team checkout are either working or taken off the site.
- [ ] Google app verified (otherwise every new user sees "Google hasn't verified this app" when connecting their calendar).
- [ ] A real support inbox (the support address currently has none).
- [ ] Live smoke test passes (`node scripts/launch-sweep/prod-smoke.cjs`).

## The listing

**Tagline (60 characters max):**
Booking link that refills cancelled slots on its own

Alternatives:
- Get booked. Stay booked. A booking link that fills gaps
- The booking link with a waitlist built in

**Description (260 characters max):**
A free booking link for coaches, therapists and consultants. When a client cancels, the next person on your waitlist is offered the slot automatically. Clients confirm before the day or the time frees up, and every request comes with an AI summary.

**Topics:** Productivity, Calendar, Scheduling, SaaS, Artificial Intelligence

**Pricing tag:** Free (with paid plans)

**Launch offer (optional):** a Product Hunt code for 3 months of Pro free, or 50% off the first year.

## Gallery (1270×760 images; the first one shows up in the feed)

1. The hero: "Cancelled slots fill themselves" with the Cancelled → Booked chip.
2. Waitlist in action: a cancelled 10:00 offered to Priya, then claimed.
3. Confirm-or-release: the reminder with "I'll be there / Release it".
4. A booking request with its AI summary ("Good fit" / "Spam").
5. The assistant moving a meeting after a "yes".
6. The Home calendar with "Add booking".
7. Pricing: Free / Pro $12 / Team $69 for 10 people.

Plus a 30–60 second video: cancel a booking, watch the waitlist offer go out, claim it.

## Maker's first comment (post it right at launch)

Hi Product Hunt 👋

I built Nodslot because every booking tool I tried stops working the moment someone books. But the expensive part of running a calendar comes after that: the 10am that cancels the night before, the no-show, the request from someone you'd never work with.

So Nodslot keeps working after the booking:
- **Cancelled slots refill themselves.** People join a waitlist for taken times; when one frees up, the first in line gets it by email.
- **Fewer no-shows.** Clients confirm a day before, or the time goes back on offer.
- **Read every request first.** Each one arrives with a short AI summary and a spam check.
- **An assistant that does the work.** "Move this week's meetings to next week" — it lists the changes and does them after you say yes.

The booking link itself is free forever with unlimited services. Pro is $12 a month, and a team of up to 10 is $69 in total, not per seat.

I'd love to hear what costs *you* the most time in your calendar. I'm here all day to answer questions.

## Launch-day plan

- **Week before:** create the Product Hunt page as "Coming soon" and collect followers. Line up 20–30 people who'll genuinely try it and comment (asking for upvotes is against the rules; ask for honest feedback).
- **12:01 AM PT (1:31 PM India time):** go live, post the maker comment, and share on X, LinkedIn and any communities you're in.
- **All day:** answer every comment within 15 minutes. Fix anything that breaks straight away.
- **Day after:** thank everyone, and post the result and what you learned.

## Sources for the timing advice

Third-party guides, not official Product Hunt guidance:
- https://getlaunchlist.com/blog/how-to-launch-on-product-hunt-2026
- https://hedrick.io/post/product-hunt-launch-guide
- https://forkoff.xyz/blog/saas-gtm/product-hunt-launch-playbook-maker-comment-timing-2026
- https://advertisingishard.com/skills/product-hunt-worth-it-2026
