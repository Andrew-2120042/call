# SEO, AEO and GEO launch plan

Everything here needs the real domain first (`src/site.config.ts`). Listings are public, so they're posted
from the owner's accounts, not automatically.

## 1. Day one (technical)
- [ ] Set the real domain, deploy, then open `/sitemap.xml`, `/robots.txt`, `/llms.txt` on it.
- [ ] Google Search Console: add the domain, submit `/sitemap.xml`, request indexing for `/`, `/pricing`, `/blog/calendly-vs-cal-com`.
- [ ] Bing Webmaster Tools: import from Search Console (Bing also feeds ChatGPT search and Copilot).
- [ ] Check each page in Google's Rich Results Test (FAQ, Article, SoftwareApplication).

## 2. Where to get listed (backlinks), in order
| Site | Why | Notes |
|---|---|---|
| Product Hunt | Launch traffic, strong link | Launch on a Tuesday–Thursday; prepare 4–5 screenshots from `public/shots` |
| AlternativeTo | Ranks for "Calendly alternative" | List Slotwise as an alternative to Calendly, Cal.com, SavvyCal, Acuity |
| SaaSHub | Free dofollow link, "alternatives" pages | Same alternative tags |
| G2 | Review site AI answers cite often | Ask the first 10 happy users for reviews |
| Capterra / GetApp / Software Advice | One Gartner listing covers all three | Free basic listing |
| StackShare | Developer-leaning, strong link | |
| BetaList, Uneed, Microlaunch, Peerlist, DevHunt | Launch directories | Quick wins in launch week |
| Indie Hackers | Founder community | Post the build story, not an ad |
| Hacker News (Show HN) | One shot; be technical and honest | "Show HN: a booking link with a waitlist for cancelled slots" |
| Reddit | Answer threads asking for Calendly alternatives or waitlists | Follow each subreddit's self-promotion rules |

## 3. Outreach (articles that already rank)
Email the authors of "best Calendly alternatives" and "Calendly vs Cal.com" articles and ask to be included,
with one sentence on what's different (built-in waitlist, confirm-or-release, flat team price):
toolradar.com, toolfinder.com, efficient.app, dupple.com, automationatlas.io, vocus.io, rework.com, clickup.com/blog.

## 4. Paste-ready listing copy
**Name:** Slotwise
**Tagline (60):** The booking link that fills its own cancellations
**Short (160):** Free scheduling link with a waitlist that refills cancelled slots, one-click attendance confirmation to stop no-shows, and AI summaries of requests.
**Long:**
Slotwise is an online booking link for professionals and small teams. Scheduling is free: unlimited services,
Google/Outlook/Apple calendar sync, video links, approvals and booking questions. Pro ($12/month) adds what
other tools leave out: a waitlist that offers cancelled slots to the next person automatically, confirm-or-release
so unconfirmed bookings free themselves up, multiple reminders and AI summaries of booking requests. Teams get
round robin and collective scheduling for $49/month for up to 10 people. Import from Calendly in a minute.
**Categories:** Scheduling, Appointment booking, Calendar, Productivity
**Alternative to:** Calendly, Cal.com, SavvyCal, Acuity Scheduling, Zoho Bookings

## 5. AEO/GEO (getting cited by AI answers)
Built in: answer-first "Short answer" boxes, FAQ and Article schema, dated and sourced comparisons, `/llms.txt`,
AI crawlers allowed in `robots.txt`. Ongoing:
- Monthly, ask ChatGPT, Perplexity, Claude, Gemini and Google AI Mode these and note whether Slotwise appears:
  "best Calendly alternative", "Calendly vs Cal.com", "scheduling tool with a waitlist", "how to fill last-minute
  cancellations", "best scheduling software 2027", "round robin scheduling for small teams".
- Re-check competitor prices every quarter and update `updated` dates in `src/content/articles.ts`.
- Reviews on G2/Capterra and mentions on Reddit matter as much as the site itself for AI answers.

## 6. Next articles to write (search demand seen in research)
- Calendly pricing explained (per seat, what each plan adds)
- Calendly alternatives for small teams
- Calendly vs SavvyCal, Cal.com vs SavvyCal
- How to share one booking link across a team
- Appointment reminder email templates
