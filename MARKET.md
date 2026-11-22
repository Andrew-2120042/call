# Market check: are we different, and what to borrow

Researched 2026-11-17 from web searches (vendor docs where available, otherwise comparison blogs, which often disagree on prices). Re-check anything marked "unverified" before quoting it publicly.

## The honest picture

The scheduling space is crowded: Calendly, Cal.com, SavvyCal, TidyCal, Acuity, zcal, Koalendar, Lunacal, Zeeg, plus dozens of small "Calendly alternatives" (which is why every short "Cal…" and "Slot…" name is taken).

**No single feature of ours is unique.** What is rare is the combination, and three or four details inside it.

| Our feature | Who else has it | What's different about ours |
|---|---|---|
| Booking requests you approve | TidyCal ("Manually approve bookings", paid plans), SavvyCal ("Require approval"), Cal.com ("Requires confirmation"), Acuity (workaround with a separate request type). Calendly: not supported as of an old community thread, unverified today. | Ours adds an AI summary of who's asking, a fit/spam label, and a drafted reply the host can send. Nobody found doing that on top of approval. |
| Screening questions | Almost everyone; Calendly's routing forms start on Teams ($16/seat). | Free on our Free plan; answers feed the AI summary. |
| Waitlist that fills cancellations | Acuity, Square Appointments, Picktime (paid), and many healthcare tools (SimplePractice, Luma, BookingPro). Not found in Calendly, Cal.com, SavvyCal, TidyCal. | Rare among tools for consultants and coaches. Ours has four modes (in order, first come first served, any time that day, earlier than my booking) and shows your place in line before joining. |
| Confirm-or-release ("are you still coming?") | Not found in the generalist tools in this research (not searched exhaustively). | Likely our most unusual feature. Releases the slot to the waitlist. |
| AI | Calendly: "Callie" email scheduling assistant (beta) and Notetaker, on Plus tiers (~$18/user). Others: mostly voice agents for clinics. | Ours is aimed at the host's decisions: request triage, rebook suggestions after a cancel, team "who's free" routing, setup assistant. Different job from Calendly's. |
| Team plan | Calendly Teams $16/seat, Cal.com ~$12/seat, SavvyCal $10–17/seat. | $69 for up to 10 people, then $10 per extra (decided 2026-11-19). Cheaper than Calendly from 5 people and Cal.com from 6. |

## So are we different?

Yes, but only if we say it the right way.

- **Don't position as "a Calendly alternative".** That's the crowded lane, and price is the only argument there (TidyCal sells a lifetime licence for under $100).
- **Position as: the booking tool for people who choose their clients.** Approval + AI triage + waitlist + confirm-or-release is one story: fewer bad-fit calls, fewer no-shows, no empty slots. No competitor found tells that whole story for solo service businesses.
- **The moat is thin.** Any of these companies could add an AI summary to their approval flow in a quarter. Speed and focus on the niche matter more than the feature list.

## Worth borrowing (ranked by value for effort)

1. **Keep "Overlay my calendar" visible.** SavvyCal's most-praised feature is letting the booker see their own calendar over the host's times. We already have it (inherited). I had suggested hiding it; don't.
2. **Hold the slot while a request is pending** (TidyCal and SavvyCal both do). Check our default: the engine has a "requires confirmation blocks slot" setting; make sure it's on, so two people can't request the same time.
3. **A launch lifetime deal** (TidyCal's whole model: one payment, reported $29–$79). A limited "founding member" Pro lifetime offer could fund launch and get first users without subscriptions.
4. **Ranked / preferred times** (SavvyCal): host marks which times they'd rather fill first. Fits our "you decide" story. Small build on top of the AI rebook picker.
5. **Meeting polls** (SavvyCal, zcal): propose a few times, people vote. Common request; medium build.
6. **Booking limits per person** ("frequency limits", SavvyCal): e.g. one free intro call per client. Cheap and on-theme.
7. **Packages, coupons, paid events** (Lunacal): only once payments are live.
8. **Card on file to auto-book a waitlist claim** (BookingPro): pairs with deposits later.
9. **Email-thread assistant like Calendly's Callie**: big build, off-theme. Skip for now.

## Naming lesson

Names starting with "Cal" or containing "slot/book + common suffix" are picked over. Checked and rejected: Slotwise (WordPress plugin, slotwise.pk, another Calendly alternative, GitHub apps), Calful (CalFull at calfull.com, same audience), Calsy (calsy.io and calsy.eu, both scheduling), Attic (all domains taken, unwinnable search term). Passed the `.com` and same-name checks: Calbee, Nodmeet, Bookusher, Admitbook. Trademarks not checked.

## Sources

- TidyCal approval: https://help.tidycal.com/article/933-how-to-enable-and-use-booking-approval-workflow
- SavvyCal approval: https://docs.savvycal.com/article/81-require-approval-for-new-events
- Acuity manual confirmation and waitlists: https://help.acuityscheduling.com/hc/en-us/articles/16676926555533-Manual-appointment-confirmation-and-waitlists-in-Acuity-Scheduling
- Calendly community thread on approval (old): https://community.calendly.com/how-do-i-40/approving-before-accepting-277
- Calendly AI suite announcement: https://finance.yahoo.com/technology/ai/articles/calendly-ai-product-suite-transforms-160300415.html
- Calendly review with Callie pricing: https://www.usecarly.com/blog/calendly-review/
- Price and feature roundups: https://scheduling-tools.org/calendly-alternatives/ , https://tidycal.com/compare/calendly-alternatives , https://zapier.com/blog/best-meeting-scheduler-apps/ , https://lunacal.ai/blogs/scheduling-software-freelancers
- Waitlist in healthcare tools: https://www.getprosper.ai/blog/patient-appointment-scheduling-software-guide , https://bookingpro.ai/product/scheduling/
