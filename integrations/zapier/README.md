# Calbee for Zapier

A Zapier Platform CLI app with four instant triggers (new booking, booking request, rescheduled, cancelled),
signed in with a Calbee API key. The server side is `/api/integrations/zapier/*` in the main app.

```bash
cd integrations/zapier
npm install
npx zapier-platform login            # opens your Zapier account
npx zapier-platform register "Calbee"
npx zapier-platform push
npx zapier-platform env:set 1.0.0 BASE_URL=https://app.<your-domain>
```

Then in developer.zapier.com → your app → **Sharing** → copy the invite link, set `ZAPIER_INVITE_LINK` in the
app's env and run `seed-app-store`. Going public in Zapier's directory needs a live domain, a few active users and
Zapier's review; the invite link works before that.
