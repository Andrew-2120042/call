# AI search tracker (ChatGPT)

Every month, ask ChatGPT the questions buyers ask right before choosing a booking tool, and note who it names and which sites it quotes. Where Calbee is missing, that's the to-do list: a page that answers the question better, or a listing on the sites ChatGPT already quotes. (Method from the "Granola AI search" reel saved in Reel Brain.)

How it was run: ChatGPT web, logged in, **Temporary chat** (so memory doesn't bias it), each question + "Please search the web." Raw answers are saved by the script in the session scratchpad; re-run with Claude ("re-run the GEO tracker").

## 2026-11-23: Calbee named in 0 of 12

| # | Question | Named | Sites quoted |
|---|---|---|---|
| 1 | Best Calendly alternative? | Cal.com, Acuity, SavvyCal, TidyCal, HubSpot, Google Calendar, Zoho Bookings | the vendors' own sites, youcanbook.me |
| 2 | Best free meeting scheduler? | Cal.com, zcal, TidyCal, Doodle, Koalendar | cal.com, calendly.com, koalendar.com, tidycal.com, zcal.co |
| 3 | Best scheduling app for coaches? | Calendly, Cal.com, Acuity, Trainerize | coachaccountable.com, simply.coach, truecoach.co |
| 4 | Booking app with a waitlist that fills cancellations? | Acuity, Fresha | avana, patientnow, visitconfirmed, wait-q, zenoti |
| 5 | Reduce no-shows for coaching/therapy, which tool? | Calendly, Zoho Bookings | protherapy.in, psychdesk.in |
| 6 | Team scheduling tool without per-seat pricing? | (shift-rota apps) | findmyshift.com, joinhomebase.com |
| 7 | Booking link that lets me approve requests? | Cal.com, YouCanBookMe | cal.com, cozycal.com, youcanbook.me |
| 8 | Scheduling software for tutors? | Calendly, Acuity, Setmore, Teachworks, TutorBird | vendors' own sites |
| 9 | Cal.com vs Calendly? | Calendly, Cal.com | cal.com, calendly.com |
| 10 | Scheduling software for personal trainers? | Mindbody, Trainerize, Vagaro, Acuity | vendors' own sites |
| 11 | Tool that fills last-minute cancellations automatically? | (restaurant tools) | opentable, sevenrooms, zenchef |
| 12 | Best meeting scheduler apps 2027? | Calendly, Cal.com, Acuity, SavvyCal, zcal, TidyCal, Doodle, Reclaim | vendors' own sites |

**What it means:** ChatGPT mostly quotes the tools' own feature and pricing pages, not review sites. Questions 4, 6, 7 and 11 had no scheduling-tool answer at all, and they're exactly what Calbee does.

**Done 2026-11-23:** blog posts that answer 4/11 (`/blog/booking-app-with-waitlist`), 6 (`/blog/team-scheduling-without-per-seat-pricing`) and 7 (`/blog/booking-software-approve-requests`); all pages sent to Bing (IndexNow), which ChatGPT search uses.

**Still to do:**
- Bing Webmaster Tools and Google Search Console: add the site and submit `/sitemap.xml` (do this on the new domain once it's bought).
- Listings on the directories AI tools read: Product Hunt, G2, Capterra, AlternativeTo, SaaSHub (owner sign-ups needed).
- Pages for coaches, tutors and personal trainers (questions 3, 8, 10) with real, profession-specific facts.
- Re-run these 12 questions on 2026-12-23.

## 2026-11-24: Perplexity and Claude (after Ramp's "every AI behaves differently")

Six of the same buyer questions (1, 2, 4, 5, 6, 7), asked in Perplexity (logged out) and Claude (incognito, web search on). **Calbee named in 0 of 6 on both.**

| # | Perplexity named | Claude named |
|---|---|---|
| 1 Calendly alternative | Cal.com, Acuity, SavvyCal, TidyCal, Doodle, Microsoft Bookings, Zoho, OnceHub, Chili Piper | Cal.com, Acuity, TidyCal, Doodle, Microsoft Bookings, Setmore, Zoho, Koalendar |
| 2 Free meeting scheduler | Cal.com, zcal, Doodle, HubSpot, Setmore | Cal.com, zcal, HubSpot, Google Calendar |
| 4 Waitlist that fills cancellations | Acuity, Square (+ small waitlist apps) | Acuity, Square (quotes their help pages) |
| 5 Reduce no-shows | Cal.com, SimplePractice, Practice Better | SimplePractice, Doodle |
| 6 Team without per-seat pricing | Calendly, Cal.com, Acuity, Square | Calendly, Cal.com, Appointlet |
| 7 Approve requests (consultants) | TidyCal, Appointlet | SavvyCal, Zoho, Koalendar, OnceHub |

**How each behaves:** ChatGPT and Claude mostly quote the tools' **own** feature and help pages. Perplexity quotes **third-party "best of" articles** and **job pages** (e.g. tidycal.com/for/consultants).

### Pages AI already quotes (where Calbee should be mentioned)
Ramp's finding: get mentioned on pages AI already trusts, not more blogs. These are the pages Perplexity quoted:
- usebund.com/blog/calendly-alternatives
- larksuite.com/en_us/blog/calendly-alternatives and /meeting-scheduling-app
- serpastra.com/blog/best-scheduling-software-for-small-business
- fabric.so/…/best-scheduling-tool-for-founders
- wpamelia.com/scheduling-software-for-small-businesses
- blog.hubspot.com/sales/best-scheduling-app
- wix.com app market (waitlist apps), gaplets.com, waitly.ai (waitlist question)

The honest way in: email each author with a short, factual note (what Calbee does that the list is missing, e.g. a built-in waitlist and flat team pricing) and offer a free Pro account to test. No paid placements disguised as editorial, no fake reviews (Claude's usage policy and Google's guidelines).

### Done 2026-11-24 for Ramp's other findings
- **Markdown for AI:** AI crawlers (GPTBot, ClaudeBot, PerplexityBot and others) now get each page's Markdown copy automatically, same content as the HTML page; search engines and people get the normal page.
- **Who's visiting:** every AI crawler visit is logged in Vercel as `ai_bot_visit` with the bot and page.
