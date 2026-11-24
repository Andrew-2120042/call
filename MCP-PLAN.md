# Use Calbee from Claude and ChatGPT (MCP connector)

Decided 2026-11-24. Build after the Product Hunt launch work. Free on every plan (SavvyCal gives the same thing away on every plan).

## What users get

They connect their Calbee account to Claude, ChatGPT (or Cursor, Claude Desktop) once, then ask in plain words:
- "What's booked tomorrow?" / "When am I free next week?"
- "Give me my intro-call link"
- "Any requests waiting? Accept Omar's, decline the spam one"
- "Move this week's Thursday sessions to Friday" / "Cancel Friday, I'm sick"
- "Who's on the waitlist for Wednesday?"
- "Make a new 45-minute service called Strategy call"
- "Add a lunch break 1–2pm on every working day"

## The plan (about a week)

1. **"Connect Calbee" login page** for Claude and ChatGPT. Standard OAuth 2.1 with PKCE and dynamic client registration, which both assistants require.
   - We already have half of it from the Cal.com code: `OAuthClient`, `AccessCode` (with PKCE) and `/auth/oauth2/authorize`.
   - Missing: discovery documents (`/.well-known/oauth-authorization-server`, `/.well-known/oauth-protected-resource`), a registration endpoint, and write permissions.
2. **Actions it can take**, reusing the Agent's 16 tools in `packages/features/assistant/lib/runAssistant.ts`:
   - get_page, create_service, update_service, update_profile
   - list_bookings, count_bookings, get_availability
   - propose_changes, reschedule_booking, cancel_booking
   - list_requests, decide_request, report_spam
   - list_waitlist, remove_from_waitlist
   - plus "share my booking link"
3. **Safety, same as the Agent:** read actions run straight away. Changes are proposed first and only happen after the user says yes in the chat. Up to ten changes at a time, only on the user's own bookings.
4. **Endpoint:** `POST /api/mcp` (streamable HTTP) in apps/web, using the official MCP TypeScript SDK.
5. **Free on every plan.** Pro-only actions (for example, AI summaries) answer with an upgrade message on Free.

## Needs the owner's OK before starting (CLAUDE.md "ask first")

- **Database change:** add write scopes to `AccessScope` (today only `READ_BOOKING`, `READ_PROFILE`), for example `MANAGE_BOOKINGS`, `MANAGE_SERVICES`, `MANAGE_AVAILABILITY`. Plus a column marking dynamically registered clients.
- **New dependency:** `@modelcontextprotocol/sdk` (only pinned in root resolutions today, not installed as a dependency).

## Launch

- A page on the website: "Use Calbee from ChatGPT and Claude", with the connector URL and a 30-second video.
- Changelog entry, and a line in the Product Hunt first comment.
- List it in the Claude and ChatGPT connector directories once approved.
